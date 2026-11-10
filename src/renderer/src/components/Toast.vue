<template>
    <div ref="container" :class="['pointer-events-none absolute right-0 z-20 flex h-[calc(100%-5rem)] flex-col items-end gap-3 overflow-auto p-3', props.topClass]" @wheel.prevent>
        <TransitionGroup name="toast">
            <button
                v-for="item in items"
                :key="item.id"
                class="pointer-events-auto flex min-w-48 max-w-72 cursor-pointer flex-col justify-center rounded-xl border border-red-200 bg-red-50 p-3 text-left text-red-800 shadow-md duration-200 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/70 dark:text-red-200 dark:hover:bg-red-900"
                type="button"
                @click="emit('dismiss', item.id)"
            >
                <h2 class="truncate text-base font-medium" :title="item.title">{{ item.title }}</h2>
                <p v-if="item.prompt" class="pt-1 text-sm truncate" :title="item.prompt">{{ item.prompt }}</p>
            </button>
        </TransitionGroup>
    </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';

const props = withDefaults(
    defineProps<{
        items: { id: number; title: string; prompt: string; duration?: number }[];
        topClass?: string;
    }>(),
    {
        topClass: 'top-20'
    }
);

const emit = defineEmits<{
    dismiss: [id: number];
}>();

const container = ref<HTMLDivElement>();
const timeouts = new Map<number, number>();

watch(
    () => props.items,
    (items) => {
        const itemIds = new Set(items.map((item) => item.id));
        for (const item of items) {
            if (timeouts.has(item.id)) continue;
            timeouts.set(
                item.id,
                window.setTimeout(() => {
                    timeouts.delete(item.id);
                    emit('dismiss', item.id);
                }, item.duration ?? 3000)
            );
        }
        for (const [id, timeout] of timeouts) {
            if (itemIds.has(id)) continue;
            window.clearTimeout(timeout);
            timeouts.delete(id);
        }
        void nextTick(() => {
            container.value?.scrollTo({ top: container.value.scrollHeight, behavior: 'smooth' });
        });
    },
    { deep: true, immediate: true }
);

onBeforeUnmount(() => {
    for (const timeout of timeouts.values()) window.clearTimeout(timeout);
});
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
    transition:
        opacity 0.3s ease,
        transform 0.3s ease;
}

.toast-leave-active {
    position: absolute;
}

.toast-move {
    transition: transform 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
    opacity: 0;
    transform: translateX(100%);
}
</style>
