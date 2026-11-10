<template>
    <!-- 遮罩层 -->
    <div v-if="store.visable" class="absolute top-0 left-0 z-20 w-full h-full bg-light-950/10"></div>

    <!-- 模态框 -->
    <div id="prompt-modal" class="modal-transform-container absolute top-0 left-0 flex items-center justify-center w-full h-full pointer-events-none">
        <Transition name="modal">
            <div v-show="store.visable" @click.stop class="relative panel-light-50 flex flex-col min-w-96 max-h-108 shadow-lg rounded-xl pointer-events-auto!">
                <!-- 关闭按钮 -->
                <div @click="store.submit(false)" class="absolute right-4 top-4 size-6 flex justify-center items-center rounded-[50%] bg-red-400 hover:bg-red-500 hover:rotate-90 duration-150 cursor-pointer">
                    <Io5CloseSharp class="w-4 text-white" />
                </div>

                <!-- 顶部 -->
                <h2 class="pt-4 pl-4 pr-12 text-xl font-semibold tracking-widest truncate shrink-0 max-w-64" :title="store.title">{{ store.title }}</h2>

                <p class="px-4 py-2 overflow-y-auto shrink-0 wrap-anywhere overflow-x-hide">{{ store.prompt }}</p>

                <!-- 内容 -->
                <div class="flex flex-col flex-1 min-h-0 gap-3 pt-3 px-4 overflow-auto">
                    <div v-for="[k, v] in Object.entries(store.fields)" :key="k" :title="v.title || ''" class="flex items-center text-sm leading-8 border border-light-950/10 rounded-2xl overflow-clip">
                        <label class="block h-full px-3 w-fit grow-0 shrink-0 bg-light-950/5">{{ v.label }}</label>
                        <input class="w-full px-2 outline-0" v-if="v.type === 'text'" v-model="v.value" type="text" :placeholder="v.placeholder || ''" />
                        <input class="w-full px-2 outline-0" v-else-if="v.type === 'number'" v-model="v.value" type="number" :min="v.min" :max="v.max" :step="v.step" :placeholder="v.placeholder || ''" />
                        <input class="w-full px-2 outline-0" v-else-if="v.type === 'password'" v-model="v.value" type="password" :placeholder="v.placeholder || ''" />
                        <input class="w-full px-2 outline-0" v-else-if="v.type === 'email'" v-model="v.value" type="email" :placeholder="v.placeholder || ''" />
                        <input class="w-full px-2 outline-0" v-else-if="v.type === 'date'" v-model="v.value" type="date" :placeholder="v.placeholder || ''" />
                        <input class="w-full px-2 outline-0" v-else-if="v.type === 'time'" v-model="v.value" type="time" :placeholder="v.placeholder || ''" />
                        <div v-else-if="v.type === 'radio'" v-for="item in v.options" :key="item.label">
                            <input v-model="v.value" type="radio" :value="item.value" />
                            <label class="pl-0.25">{{ item.label }}</label>
                        </div>
                    </div>
                </div>

                <div class="flex justify-end gap-4 p-4 shrink-0">
                    <button @click="store.submit(false)" class="px-4 py-1 text-sm duration-150 border rounded-lg cursor-pointer border-light-950/10 text-light-950/90 bg-light-950/3 hover:bg-light-500 hover:text-light-50 hover:border-transparent hover:drop-shadow-accent">{{ $t('prompt.cancel') }}</button>
                    <button @click="store.submit(true)" class="px-4 py-1 text-sm duration-150 border rounded-lg cursor-pointer border-light-950/10 text-light-950/90 bg-light-950/3 hover:bg-light-500 hover:text-light-50 hover:border-transparent hover:drop-shadow-accent">{{ $t('prompt.confirm') }}</button>
                </div>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
@reference "tailwindcss";

.modal-form {
    & > input {
        @apply px-0.5 outline-0 shrink;
    }

    & > input[type='text'],
    & > input[type='number'],
    & > input[type='password'],
    & > input[type='email'] {
        @apply grow h-full text-sm rounded-lg duration-150;
        border: 1px solid color-mix(in srgb, var(--color-fg) 10%, transparent);
        background-color: color-mix(in srgb, var(--color-bg) 15%, transparent);
        &:hover {
            background-color: color-mix(in srgb, var(--color-bg) 25%, transparent);
        }
    }

    & > input[type='date'],
    & > input[type='time'] {
        @apply h-full cursor-pointer;
    }

    & > input[type='file'] {
        @apply px-0.5 cursor-pointer rounded-lg duration-150;
        &:hover {
            background-color: color-mix(in srgb, var(--color-bg) 25%, transparent);
        }
    }
}
</style>

<style scoped>
.modal-enter-active {
    transition: all 0.3s ease-in-out;
}
.modal-leave-active {
    transition: all 0.2s ease-in-out;
}
.modal-enter-from {
    transform: scale(0.95) rotateX(10deg) rotateY(-20deg);
    opacity: 0;
}
.modal-enter-to,
.modal-leave-from {
    transform: scale(1);
    opacity: 1;
}
.modal-leave-to {
    transform: scale(1.05);
    opacity: 0;
}
</style>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, watch } from 'vue';
import { Io5CloseSharp } from 'vue-icons-plus/io5';
import { usePromptStore } from '../store/prompt';

const store = usePromptStore();

watch(() => store.visable, async (visible) => {
    if (!visible) return;
    await nextTick();
    document.querySelector<HTMLInputElement>('#prompt-modal input')?.focus();
});

// 监听 esc 按键以触发取消
const handleEsc = (e: KeyboardEvent) => {
    if (!store.visable) return;
    if (e.key === 'Escape') {
        store.submit(false);
    } else if (e.key === 'Enter' && !e.isComposing && e.keyCode !== 229) {
        e.preventDefault();
        store.submit(true);
    }
};
onMounted(() => {
    window.addEventListener('keydown', handleEsc);
});
onUnmounted(() => {
    window.removeEventListener('keydown', handleEsc);
});
</script>
