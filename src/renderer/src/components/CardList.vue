<template>
    <div class="size-full min-h-0 p-2">
        <div ref="containerRef" class="pr-2 size-full overflow-y-auto">
            <ul class="grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-2">
                <slot />
            </ul>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const containerRef = ref<HTMLDivElement | null>(null);

defineExpose({
    scrollToTop: () => {
        containerRef.value?.scrollTo({ top: 0 });
    }
});
</script>
