<template>
    <WindowTitleBar>
        <template #left>
            <div class="flex items-center gap-3 pl-5">
                <img :src="appIcon" alt="" class="size-9 shrink-0 rounded-[10px] object-cover" />
                <h1 class="text-lg">{{ $t('app.title') }}</h1>
            </div>
        </template>
        <template #right>
            <button class="group grid size-4.5 cursor-pointer place-items-center rounded-full bg-error text-black focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent" type="button" :aria-label="$t('window.minimize')" :title="$t('window.minimize')" @click="windowApi.minimize()">
                <RiSubtractLine class="size-[15px] opacity-0 duration-100 group-hover:opacity-80 group-focus-visible:opacity-80" aria-hidden="true" />
            </button>
            <button class="group grid size-4.5 cursor-pointer place-items-center rounded-full bg-warning text-black focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent" type="button" :aria-label="$t(maximized ? 'window.restore' : 'window.maximize')" :title="$t(maximized ? 'window.restore' : 'window.maximize')" @click="windowApi.maximize()">
                <RiCollapseDiagonalFill v-if="maximized" class="size-[15px] opacity-0 duration-100 group-hover:opacity-80 group-focus-visible:opacity-80" aria-hidden="true" />
                <RiExpandDiagonalFill v-else class="size-[15px] opacity-0 duration-100 group-hover:opacity-80 group-focus-visible:opacity-80" aria-hidden="true" />
            </button>
            <button class="group grid size-4.5 cursor-pointer place-items-center rounded-full bg-success text-black focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent" type="button" :aria-label="$t('window.close')" :title="$t('window.close')" @click="windowApi.close()">
                <RiCloseLine class="size-[15px] opacity-0 duration-100 group-hover:opacity-80 group-focus-visible:opacity-80" aria-hidden="true" />
            </button>
        </template>
    </WindowTitleBar>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { RiSubtractLine, RiCollapseDiagonalFill, RiExpandDiagonalFill, RiCloseLine } from 'vue-icons-plus/ri';
import WindowTitleBar from './WindowTitleBar.vue';
import appIcon from '../assets/l4d2am-icon.png';

const windowApi = window.api.window;
const maximized = ref(false);
let removeStateListener: (() => void) | undefined;

onMounted(async () => {
    removeStateListener = windowApi.onStateChanged((value) => { maximized.value = value; });
    maximized.value = await windowApi.isMaximized();
});

onUnmounted(() => removeStateListener?.());
</script>
