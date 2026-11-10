<template>
    <Teleport to="body">
        <Transition name="fade-slide-up">
            <div v-if="visible" ref="menuRef" :style="{ left: `${x}px`, top: `${y}px` }" class="fixed z-50 min-w-32 rounded-lg border border-light-950/10 bg-light-50 p-1 shadow-lg">
                <slot />
            </div>
        </Transition>
    </Teleport>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';

defineProps<{
    visible: boolean;
    x: number;
    y: number;
}>();

const emits = defineEmits<{
    close: [];
}>();

const menuRef = ref<HTMLDivElement | null>(null);

const closeOnOutsidePointerDown = (event: PointerEvent) => {
    if (menuRef.value?.contains(event.target as Node)) return;
    emits('close');
};

const closeOnEscape = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') return;
    emits('close');
};

const closeOnScroll = () => {
    emits('close');
};

onMounted(() => {
    window.addEventListener('pointerdown', closeOnOutsidePointerDown);
    window.addEventListener('keydown', closeOnEscape);
    window.addEventListener('scroll', closeOnScroll, true);
});

onUnmounted(() => {
    window.removeEventListener('pointerdown', closeOnOutsidePointerDown);
    window.removeEventListener('keydown', closeOnEscape);
    window.removeEventListener('scroll', closeOnScroll, true);
});
</script>
