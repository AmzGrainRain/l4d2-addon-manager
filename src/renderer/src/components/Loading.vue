<template>
    <Transition name="loading">
        <div v-if="store.visible" class="absolute inset-0 z-30 flex items-center justify-center rounded-xl bg-light-950/15 p-3 backdrop-blur-[1px]" role="status" aria-live="polite" aria-busy="true">
            <div class="flex min-w-40 flex-col items-center gap-3 rounded-2xl border border-light-950/10 bg-light-50/95 px-6 py-5 shadow-lg">
                <div
                    class="loading-spinner"
                    :style="{
                        '--size': '42px',
                        '--line-width': '5px',
                        '--foreground': 'var(--color-accent)',
                        '--background': 'color-mix(in srgb, var(--color-light-950) 8%, transparent)'
                    }"
                ></div>
                <p class="max-w-64 truncate text-sm font-semibold text-light-950/65" :title="store.prompt || t('workshop.loading')">
                    {{ store.prompt || t('workshop.loading') }}
                </p>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useLoadingStore } from '../store/loading';

const store = useLoadingStore();
const { t } = useI18n();
</script>

<style scoped>
.loading-spinner {
    aspect-ratio: 1;
    width: var(--size);
    border-width: var(--line-width);
    border-style: solid;
    border-color: var(--background);
    border-left-color: var(--foreground);
    border-radius: 9999px;
    animation: loading-circle 0.75s linear infinite;
}

@keyframes loading-circle {
    from { transform: rotate(0); }
    to { transform: rotate(360deg); }
}

.loading-enter-active,
.loading-leave-active {
    transition: opacity 0.16s ease;
}

.loading-enter-from,
.loading-leave-to {
    opacity: 0;
}
</style>
