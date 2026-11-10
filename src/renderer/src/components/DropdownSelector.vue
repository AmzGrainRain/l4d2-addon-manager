<template>
    <div
        :style="{
            '--w': `calc(var(--spacing) * ${width})`,
            '--h': `calc(var(--spacing) * ${height})`,
            zIndex
        }"
        class="relative components:dropdown-selector w-(--w) h-(--h) rounded-3xl"
    >
        <div class="absolute top-0 left-0 z-10 flex size-full p-0.5 bg-accent rounded-3xl">
            <div style="border-radius: calc(var(--radius-3xl) - 1px)" class="size-full bg-light-50">
                <slot name="default"></slot>
            </div>
            <div @click="dropdown = !dropdown" class="flex items-center justify-center px-1.5 indicator cursor-pointer">
                <PiTriangleFill :class="dropdown ? '-rotate-180' : '-rotate-90'" class="duration-150 size-4 text-light-50" />
            </div>
        </div>

        <div
            :class="{ 'pt-1! opacity-0': !dropdown }"
            :style="{
                '--base-h': 'calc(var(--h) + var(--spacing))',
                zIndex: listZIndex
            }"
            class="absolute top-0 left-0 w-full p-1 pt-(--base-h) duration-150 border border-light-950/10 rounded-3xl bg-light-50"
        >
            <ul :style="`--max-h: ${dropdown ? `calc((var(--h) * ${expandCount}) + var(--spacing) * ${expandCount === 0 ? 0 : expandCount - 1})` : 0}`" class="flex flex-col gap-1 max-h-(--max-h) rounded-[calc(var(--radius-3xl)-4px)] overflow-auto scrollbar-thin">
                <slot name="list"></slot>
            </ul>
        </div>
    </div>
</template>

<style scoped>
@reference "tailwindcss";

ul > :deep(li) {
    @apply shrink-0;
    height: var(--h);
    background-color: var(--color-light-100);
    border-radius: calc(var(--radius-3xl) - 4px);
}
</style>

<script lang="ts" setup>
import { ref } from 'vue';
import { PiTriangleFill } from 'vue-icons-plus/pi';

withDefaults(
    defineProps<{
        width: number;
        height: number;
        expandCount: number;
        zIndex?: number | string;
        listZIndex?: number | string;
    }>(),
    {
        zIndex: 'auto',
        listZIndex: 0
    }
);

const dropdown = ref(false);

defineExpose({
    close: () => {
        dropdown.value = false;
    }
});
</script>
