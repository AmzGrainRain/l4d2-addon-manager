<template>
    <div class="flex size-full min-h-0 flex-col">
        <PageHeader>
            <template #title>{{ $t(`workshop.${state}`) }}</template>
            <template #subtitle>{{ $t(`workshop.${state}Description`) }}</template>
            <template #right>
                <Button
                    v-if="selectedIds.size"
                    :disabled="!!working"
                    @click="perform([...selectedIds], 'disable')"
                >
                    {{ $t('workshop.disableSelected', { count: selectedIds.size }) }}
                </Button>
                <Button :disabled="loading" @click="load">{{ $t('workshop.refresh') }}</Button>
            </template>
        </PageHeader>

        <p v-if="error" role="alert" class="m-4 rounded-lg border border-error/20 bg-error/10 p-3 text-sm text-error">{{ error }}</p>
        <p v-if="!loading && !error && !Object.keys(store.items[state]).length" class="p-4 text-sm text-light-950/50">{{ $t('workshop.empty') }}</p>

        <CardList v-else>
            <li
                v-for="item in store.items[state]"
                :key="item.id"
                class="group relative flex h-fit min-w-0 flex-col self-start overflow-clip rounded-lg border bg-light-100"
                :class="selectedIds.has(item.id) ? 'border-accent ring-2 ring-accent/40' : 'border-light-950/10'"
                @contextmenu.prevent="openContextMenu($event, item.id)"
            >
                <input
                    type="checkbox"
                    :checked="selectedIds.has(item.id)"
                    class="absolute left-2 top-2 z-10 size-5 accent-accent"
                    :aria-label="$t('workshop.selectItem', { id: item.id })"
                    @click.stop
                    @change="toggleSelected(item.id)" />
                <div v-if="item.hasPreview" class="aspect-video w-full overflow-hidden bg-light-100">
                    <img
                        :src="getPreviewSrc(item)"
                        :alt="item.id"
                        loading="lazy"
                        decoding="async"
                        draggable="false"
                        class="size-full cursor-pointer object-cover"
                        @click="toggleSelected(item.id)" />
                </div>
                <div v-else class="flex aspect-video w-full cursor-pointer items-center justify-center text-sm text-light-950/45" @click="toggleSelected(item.id)">{{ $t('workshop.noPreview') }}</div>
                
                <div class="flex items-center justify-between gap-2 bg-light-50 p-3 text-light-950">
                    <div class="flex min-w-0 flex-col">
                        <button
                            type="button"
                            class="max-w-full truncate text-left font-semibold cursor-pointer hover:text-accent"
                            :title="$t('workshop.editAlias')"
                            @click.stop="editAlias(item.id)"
                        >
                            {{ store.aliases[item.id] || item.id }}
                        </button>
                        <span class="truncate text-xs text-light-950/45">{{ item.id }}</span>
                    </div>
                    <div class="flex shrink-0 gap-2">
                    </div>
                </div>
            </li>
        </CardList>

        <ContextMenu
            :visible="contextMenuVisible"
            :x="contextMenuX"
            :y="contextMenuY"
            @close="contextMenuVisible = false">
            <button
                type="button"
                class="flex w-full items-center rounded px-3 py-2 text-left text-sm font-semibold cursor-pointer hover:bg-light-950/5 disabled:opacity-45"
                :disabled="!!working"
                @click="perform(contextMenuIds, 'localize'); contextMenuVisible = false"
            >
                {{ $t('workshop.localizeSelected', { count: contextMenuIds.length }) }}
            </button>
            <button
                type="button"
                class="flex w-full items-center rounded px-3 py-2 text-left text-sm font-semibold cursor-pointer hover:bg-light-950/5 disabled:opacity-45"
                :disabled="!!working"
                @click="perform(contextMenuIds, 'disable'); contextMenuVisible = false"
            >
                {{ $t('workshop.disableSelected', { count: contextMenuIds.length }) }}
            </button>
            <button
                type="button"
                class="flex w-full items-center rounded px-3 py-2 text-left text-sm font-semibold cursor-pointer hover:bg-light-950/5 disabled:opacity-45"
                :disabled="!!working"
                @click="exportSelected(contextMenuIds); contextMenuVisible = false"
            >
                {{ $t('workshop.exportZip') }}
            </button>
        </ContextMenu>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WorkshopItem, WorkshopState } from '../../../shared/workshop';
import { useWorkshopStore } from '../store/workshop';
import PageHeader from '../components/PageHeader.vue';
import CardList from '../components/CardList.vue';
import Button from '../components/form/Button.vue';
import ContextMenu from '../components/ContextMenu.vue';
import { usePromptStore } from '../store/prompt';
import { useLoadingStore } from '../store/loading';

const page: { state: WorkshopState } = { state: 'synced' };
const state = page.state;
const { t } = useI18n();
const store = useWorkshopStore();
const promptStore = usePromptStore();
const loadingStore = useLoadingStore();
const loading = ref(false);
const working = ref('');
const error = ref('');
const selectedIds = ref(new Set<string>());
const contextMenuVisible = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);
const contextMenuIds = ref<string[]>([]);

const getPreviewSrc = (item: WorkshopItem) => `workshop-preview://${state === 'disabled' ? `disabled-${item.source}` : state}/${item.id}`;

const load = async () => {
    loading.value = true;
    error.value = '';
    try {
        await loadingStore.run(() => store.refresh(state), t('workshop.loading'));
        selectedIds.value.clear();
    } catch (cause) {
        error.value = `${t('workshop.loadError')}: ${String(cause)}`;
    } finally {
        loading.value = false;
    }
};

const perform = async (target: string | string[], action: 'disable' | 'restore' | 'delete' | 'localize') => {
    const ids = Array.isArray(target) ? target : [target];
    if (action === 'disable' || action === 'delete') {
        const actionKey = action === 'disable' ? 'workshop.disable' : 'workshop.delete';
        const confirmationKey = action === 'disable'
            ? (ids.length > 1 ? 'workshop.confirmDisableSelected' : 'workshop.confirmDisable')
            : (ids.length > 1 ? 'workshop.confirmDeleteSelected' : 'workshop.confirmDelete');
        if (!await promptStore.show(t(actionKey), t(confirmationKey, { id: ids[0], count: ids.length }), {})) return;
    }
    working.value = ids[0];
    error.value = '';
    try {
        await loadingStore.run(async () => {
            for (const id of ids) {
                if (action === 'localize') await window.api.workshop.localize(id);
                else await window.api.workshop[action](id, store.items[state][id].source);
            }
            selectedIds.value.clear();
            await Promise.all([store.refresh('synced'), store.refresh('installed'), store.refresh('disabled')]);
        }, t('workshop.loading'));
    } catch (cause) {
        error.value = `${t('workshop.actionError')}: ${String(cause)}`;
        try {
            await store.refresh(state);
        } catch {
            // Preserve the original operation error.
        }
    } finally {
        working.value = '';
    }
};

const exportSelected = async (target: string | string[]) => {
    const ids = Array.isArray(target) ? target : [target];
    const result = await window.api.dialog.save({
        title: t('workshop.exportZip'),
        defaultPath: 'left4dead2-addons.zip',
        filters: [{ name: 'ZIP archive', extensions: ['zip'] }]
    });
    if (result.canceled || !result.filePath) return;

    working.value = ids[0];
    error.value = '';
    try {
        await loadingStore.run(() => window.api.workshop.export(state, ids.map((id) => ({ id, source: store.items[state][id].source })), result.filePath!), t('workshop.exporting'));
    } catch (cause) {
        error.value = `${t('workshop.exportError')}: ${String(cause)}`;
    } finally {
        working.value = '';
    }
};

onMounted(load);

const toggleSelected = (id: string) => {
    if (selectedIds.value.has(id)) selectedIds.value.delete(id);
    else selectedIds.value.add(id);
};

const openContextMenu = (event: MouseEvent, id: string) => {
    if (!selectedIds.value.has(id)) {
        selectedIds.value.clear();
        selectedIds.value.add(id);
    }
    contextMenuIds.value = [...selectedIds.value];
    contextMenuX.value = event.clientX;
    contextMenuY.value = event.clientY;
    contextMenuVisible.value = true;
};

const editAlias = async (id: string) => {
    const accepted = await promptStore.show(t('workshop.editAlias'), t('workshop.editAliasPrompt'), {
        alias: { id: 'alias', label: t('workshop.alias'), type: 'text', value: store.aliases[id] ?? '', placeholder: t('workshop.alias') }
    });
    if (accepted) store.setAlias(id, String(promptStore.fields.alias?.value ?? ''));
};
</script>

