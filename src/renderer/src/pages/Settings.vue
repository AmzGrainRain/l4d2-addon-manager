<template>
    <div id="page:settings" class="flex size-full flex-col">
        <PageHeader>
            <template #title>{{ $t('navigation.settings') }}</template>
            <template #subtitle>{{ $t('settings.description') }}</template>
        </PageHeader>

        <div class="min-h-0 flex-1 flex flex-col gap-4 overflow-y-auto p-4">
            <section class="h-fit rounded-lg border border-light-950/10 bg-light-50 p-4">
                <div class="flex items-center gap-2">
                    <BsFolder2Open class="size-4 shrink-0 text-accent" />
                    <h3 class="truncate text-base font-bold text-light-950/75">{{ $t('game.title') }}</h3>
                </div>
                <p class="mt-1 text-sm text-light-950/45">{{ $t('game.description') }}</p>

                <div class="mt-4 grid grid-cols-[max-content_minmax(0,1fr)] gap-x-4 gap-y-2 rounded-lg bg-light-100 p-3 text-xs">
                    <span class="text-light-950/45">{{ $t('game.executable') }}</span>
                    <span class="break-all text-light-950/70">{{ directories.executablePath || $t('game.notSelected') }}</span>
                    <template v-if="directories.executablePath">
                        <span class="text-light-950/45">{{ $t('game.workshop') }}</span>
                        <span class="break-all text-light-950/70">{{ directories.workshopDirectory }}</span>
                        <span class="text-light-950/45">{{ $t('game.addons') }}</span>
                        <span class="break-all text-light-950/70">{{ directories.addonDirectory }}</span>
                    </template>
                </div>

                <div class="mt-4 flex flex-wrap gap-2 border-t border-light-950/10 pt-3">
                    <Button :disabled="!directories.workshopDirectory" @click="openGameDirectory('workshop')">{{ $t('game.openWorkshop') }}</Button>
                    <Button :disabled="!directories.addonDirectory" @click="openGameDirectory('addon')">{{ $t('game.openAddons') }}</Button>
                    <Button @click="selectGame">{{ $t('game.select') }}</Button>
                    <Button :disabled="detectingGame" @click="autoDetectGame">{{ $t(detectingGame ? 'game.detecting' : 'game.autoDetect') }}</Button>
                </div>
                <p v-if="gameError" role="alert" class="mt-3 text-sm text-error">{{ gameError }}</p>
            </section>
            <section class="h-fit rounded-lg border border-light-950/10 bg-light-50 p-4">
                <div class="flex items-center justify-between gap-4 max-md:flex-col max-md:items-stretch">
                    <div class="min-w-0">
                        <div class="flex items-center gap-2">
                            <BsTranslate class="size-4 shrink-0 text-accent" />
                            <h3 class="truncate text-base font-bold text-light-950/75">{{ $t('settings.language') }}</h3>
                        </div>
                        <p class="mt-1 text-sm text-light-950/45">{{ $t('settings.languageDescription') }}</p>
                    </div>
                    <DropdownSelector ref="languageDropdownRef" :width="42" :height="10" :expand-count="languageOptions.length" :z-index="20" class="shrink-0">
                        <div class="flex size-full items-center px-3 pr-2">
                            <span class="min-w-0 truncate text-sm font-semibold text-light-950/70">{{ currentLanguageLabel }}</span>
                        </div>
                        <template #list>
                            <li v-for="option in languageOptions" :key="option.value" class="flex cursor-pointer items-center justify-between gap-2 px-3 text-sm font-semibold text-light-950/65 duration-150 hover:text-accent" @click="locale = option.value; languageDropdownRef?.close()">
                                <span class="min-w-0 truncate">{{ option.label }}</span>
                                <BsCheckCircleFill v-if="locale === option.value" class="size-3.5 shrink-0 text-accent" />
                            </li>
                        </template>
                    </DropdownSelector>
                </div>
            </section>
            <section class="h-fit rounded-lg border border-light-950/10 bg-light-50 p-4">
                <div class="flex items-center justify-between gap-4 max-md:flex-col max-md:items-stretch">
                    <div class="min-w-0">
                        <div class="flex items-center gap-2">
                            <BsCircleHalf class="size-4 shrink-0 text-accent" />
                            <h3 class="truncate text-base font-bold text-light-950/75">{{ $t('settings.theme') }}</h3>
                        </div>
                        <p class="mt-1 text-sm text-light-950/45">{{ $t('settings.themeDescription') }}</p>
                    </div>
                    <DropdownSelector ref="themeDropdownRef" :width="42" :height="10" :expand-count="themeOptions.length" :z-index="19" class="shrink-0">
                        <div class="flex size-full items-center px-3 pr-2">
                            <span class="min-w-0 truncate text-sm font-semibold text-light-950/70">{{ currentThemeLabel }}</span>
                        </div>
                        <template #list>
                            <li v-for="option in themeOptions" :key="option.value" class="flex cursor-pointer items-center justify-between gap-2 px-3 text-sm font-semibold text-light-950/65 duration-150 hover:text-accent" @click="themeStore.apply(option.value); themeDropdownRef?.close()">
                                <span class="min-w-0 truncate">{{ option.label }}</span>
                                <BsCheckCircleFill v-if="themeStore.preference === option.value" class="size-3.5 shrink-0 text-accent" />
                            </li>
                        </template>
                    </DropdownSelector>
                </div>
            </section>
            <section class="h-fit rounded-lg border border-light-950/10 bg-light-50 p-4">
                <div class="flex items-center justify-between gap-4 max-md:flex-col max-md:items-stretch">
                    <div class="min-w-0">
                        <div class="flex items-center gap-2">
                            <BsPalette class="size-4 shrink-0 text-accent" />
                            <h3 class="truncate text-base font-bold text-light-950/75">{{ $t('settings.accentColor') }}</h3>
                        </div>
                        <p class="mt-1 text-sm text-light-950/45">{{ $t('settings.accentColorDescription') }}</p>
                    </div>
                    <DropdownSelector ref="accentColorDropdownRef" :width="42" :height="10" :expand-count="accentColorOptions.length" :z-index="18" class="shrink-0">
                        <div class="flex size-full items-center gap-2 px-3 pr-2">
                            <span class="size-3.5 rounded-full border border-light-950/15" :style="{ backgroundColor: accentColorOptions.find((option) => option.value === themeStore.accentColor)?.color }" />
                            <span class="min-w-0 truncate text-sm font-semibold text-light-950/70">{{ currentAccentColorLabel }}</span>
                        </div>
                        <template #list>
                            <li v-for="option in accentColorOptions" :key="option.value" class="flex cursor-pointer items-center justify-between gap-2 px-3 text-sm font-semibold text-light-950/65 duration-150 hover:text-accent" @click="themeStore.applyAccentColor(option.value); accentColorDropdownRef?.close()">
                                <span class="flex min-w-0 items-center gap-2 truncate">
                                    <span class="size-3.5 shrink-0 rounded-full border border-light-950/15" :style="{ backgroundColor: option.color }" />
                                    {{ option.label }}
                                </span>
                                <BsCheckCircleFill v-if="themeStore.accentColor === option.value" class="size-3.5 shrink-0 text-accent" />
                            </li>
                        </template>
                    </DropdownSelector>
                </div>
            </section>
            <section class="h-fit rounded-lg border border-light-950/10 bg-light-50 p-4">
                <div class="flex items-center justify-between gap-4">
                    <div class="min-w-0">
                        <div class="flex items-center gap-2">
                            <BsLayoutSidebarInset class="size-4 shrink-0 text-accent" />
                            <h3 class="truncate text-base font-bold text-light-950/75">{{ $t('settings.sidebarExpanded') }}</h3>
                        </div>
                        <p class="mt-1 text-sm text-light-950/45">{{ $t('settings.sidebarExpandedDescription') }}</p>
                    </div>
                    <ToggleInput :model-value="sidebarStore.expanded" @update:model-value="sidebarStore.setExpanded" />
                </div>
            </section>
            <section class="h-fit rounded-lg border border-light-950/10 bg-light-50 p-4">
                <div class="flex flex-wrap items-center justify-between gap-4">
                    <div class="min-w-0">
                        <div class="flex items-center gap-2">
                            <BsTags class="size-4 shrink-0 text-accent" />
                            <h3 class="truncate text-base font-bold text-light-950/75">{{ $t('settings.aliasManagement') }}</h3>
                        </div>
                        <p class="mt-1 text-sm text-light-950/45">{{ $t('settings.aliasManagementDescription', { count: aliasCount }) }}</p>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <Button variant="danger" :disabled="aliasBusy" @click="clearAliases">{{ $t('settings.clearAliases') }}</Button>
                        <Button :disabled="aliasBusy" @click="importAliases">{{ $t('settings.importAliases') }}</Button>
                        <Button :disabled="aliasBusy" @click="exportAliases">{{ $t('settings.exportAliases') }}</Button>
                    </div>
                </div>
                <p v-if="aliasError" role="alert" class="mt-3 text-sm text-error">{{ aliasError }}</p>
                <p v-else-if="aliasMessage" role="status" class="mt-3 text-sm text-light-950/55">{{ aliasMessage }}</p>
            </section>
            <section class="h-fit rounded-lg border border-light-950/10 bg-light-50 p-4">
                <div class="flex items-center justify-between gap-4">
                    <div class="flex min-w-0 items-center gap-2">
                        <BsCodeSlash class="size-4 shrink-0 text-accent" />
                        <h3 class="truncate text-base font-bold text-light-950/75">{{ $t('settings.developerTools') }}</h3>
                    </div>
                    <Button class="shrink-0" @click="openDevTools">{{ $t('settings.openDevTools') }}</Button>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { BsTranslate, BsCircleHalf, BsCheckCircleFill, BsFolder2Open, BsLayoutSidebarInset, BsCodeSlash, BsTags, BsPalette } from 'vue-icons-plus/bs';
import PageHeader from '../components/PageHeader.vue';
import DropdownSelector from '../components/DropdownSelector.vue';
import Button from '../components/form/Button.vue';
import ToggleInput from '../components/form/ToggleInput.vue';
import { languageOptions } from '../locales';
import { useThemeStore } from '../store/theme';
import { useSidebarStore } from '../store/sidebar';
import { useWorkshopStore } from '../store/workshop';
import { usePromptStore } from '../store/prompt';
import type { GameDirectories } from '../../../shared/workshop';

const { locale, t } = useI18n({ useScope: 'global' });
const themeStore = useThemeStore();
const sidebarStore = useSidebarStore();
const workshopStore = useWorkshopStore();
const promptStore = usePromptStore();
const directories = ref<GameDirectories>({ executablePath: '', workshopDirectory: '', addonDirectory: '' });
const gameError = ref('');
const detectingGame = ref(false);
const aliasBusy = ref(false);
const aliasError = ref('');
const aliasMessage = ref('');
const languageDropdownRef = ref<InstanceType<typeof DropdownSelector>>();
const themeDropdownRef = ref<InstanceType<typeof DropdownSelector>>();
const currentLanguageLabel = computed(() => languageOptions.find((option) => option.value === locale.value)?.label || locale.value);
const aliasCount = computed(() => Object.keys(workshopStore.aliases).length);
const accentColorDropdownRef = ref<InstanceType<typeof DropdownSelector>>();
const themeOptions = computed(() => [
    { value: 'system' as const, label: t('settings.system') },
    { value: 'dark' as const, label: t('settings.dark') },
    { value: 'light' as const, label: t('settings.light') }
]);
const currentThemeLabel = computed(() => themeOptions.value.find((option) => option.value === themeStore.preference)?.label || themeStore.preference);
const accentColorOptions = computed(() => [
    { value: 'red' as const, label: t('settings.accentRed'), color: '#ef4444' },
    { value: 'orange' as const, label: t('settings.accentOrange'), color: '#ff754b' },
    { value: 'pink' as const, label: t('settings.accentPink'), color: '#ec4899' },
    { value: 'purple' as const, label: t('settings.accentPurple'), color: '#a855f7' },
    { value: 'indigo' as const, label: t('settings.accentIndigo'), color: '#6366f1' },
    { value: 'blue' as const, label: t('settings.accentBlue'), color: '#3b82f6' },
    { value: 'cyan' as const, label: t('settings.accentCyan'), color: '#06b6d4' },
    { value: 'teal' as const, label: t('settings.accentTeal'), color: '#14b8a6' },
    { value: 'green' as const, label: t('settings.accentGreen'), color: '#22c55e' },
    { value: 'lime' as const, label: t('settings.accentLime'), color: '#84cc16' },
    { value: 'amber' as const, label: t('settings.accentAmber'), color: '#f59e0b' }
]);
const currentAccentColorLabel = computed(() => accentColorOptions.value.find((option) => option.value === themeStore.accentColor)?.label || t('settings.accentRed'));
watch(locale, (value) => localStorage.setItem('language', value));
onMounted(async () => { directories.value = await window.api.game.getDirectories(); });

const autoDetectGame = async () => {
    gameError.value = '';
    detectingGame.value = true;
    try {
        directories.value = await window.api.game.autoDetect();
    } catch (error) {
        gameError.value = `${t('game.autoDetectError')}: ${String(error)}`;
    } finally {
        detectingGame.value = false;
    }
};

const selectGame = async () => {
    gameError.value = '';
    try {
        const result = await window.api.dialog.open({
            title: t('game.select'),
            properties: ['openFile'],
            filters: [{ name: 'Left 4 Dead 2', extensions: ['exe'] }]
        });
        if (result.canceled || !result.filePaths[0]) return;
        directories.value = await window.api.game.saveExecutable(result.filePaths[0]);
    } catch (error) {
        gameError.value = `${t('game.invalid')}: ${String(error)}`;
    }
};

const openGameDirectory = async (directoryType: 'workshop' | 'addon') => {
    gameError.value = '';
    try {
        await window.api.game.openDirectory(directoryType);
    } catch (error) {
        gameError.value = `${t('game.openError')}: ${String(error)}`;
    }
};

const openDevTools = () => window.api.window.openDevTools();

const importAliases = async () => {
    aliasError.value = '';
    aliasMessage.value = '';
    aliasBusy.value = true;
    try {
        const result = await window.api.dialog.open({
            title: t('settings.importAliases'),
            properties: ['openFile'],
            filters: [{ name: 'CSV', extensions: ['csv'] }]
        });
        if (result.canceled || !result.filePaths[0]) return;
        const entries = await window.api.aliases.importCsv(result.filePaths[0]);
        workshopStore.importAliases(entries);
        aliasMessage.value = t('settings.aliasesImported', { count: entries.length });
    } catch (error) {
        aliasError.value = `${t('settings.aliasImportError')}: ${String(error)}`;
    } finally {
        aliasBusy.value = false;
    }
};

const exportAliases = async () => {
    aliasError.value = '';
    aliasMessage.value = '';
    aliasBusy.value = true;
    try {
        const result = await window.api.dialog.save({
            title: t('settings.exportAliases'),
            defaultPath: 'addon-aliases.csv',
            filters: [{ name: 'CSV', extensions: ['csv'] }]
        });
        if (result.canceled || !result.filePath) return;
        const outputPath = result.filePath.toLowerCase().endsWith('.csv') ? result.filePath : `${result.filePath}.csv`;
        await window.api.aliases.exportCsv(workshopStore.aliases, outputPath);
        aliasMessage.value = t('settings.aliasesExported', { count: aliasCount.value });
    } catch (error) {
        aliasError.value = `${t('settings.aliasExportError')}: ${String(error)}`;
    } finally {
        aliasBusy.value = false;
    }
};

const clearAliases = async () => {
    const accepted = await promptStore.show(t('settings.clearAliases'), t('settings.confirmClearAliases'), {});
    if (!accepted) return;
    workshopStore.clearAliases();
    aliasError.value = '';
    aliasMessage.value = t('settings.aliasesCleared');
};
</script>
