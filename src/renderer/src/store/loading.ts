import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useLoadingStore = defineStore('loading', () => {
    const visible = ref(false);
    const prompt = ref('');
    const pendingCount = ref(0);

    function show(prompt_ = ''): void {
        pendingCount.value += 1;
        prompt.value = prompt_;
        visible.value = true;
    }

    function hide(): void {
        pendingCount.value = Math.max(0, pendingCount.value - 1);
        if (pendingCount.value !== 0) return;

        visible.value = false;
        prompt.value = '';
    }

    async function run<T>(task: () => T | Promise<T>, prompt_ = ''): Promise<T> {
        show(prompt_);
        try {
            return await task();
        } finally {
            hide();
        }
    }

    return {
        visible: computed(() => visible.value),
        prompt: computed(() => prompt.value),
        show,
        hide,
        run
    };
});
