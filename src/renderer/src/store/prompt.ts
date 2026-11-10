import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { PromptFieldObject } from './prompt.types';

export const DefaultFields = {
    name: { id: 'name', label: '名称', type: 'text', value: '', placeholder: '名称' },
    cover: { id: 'background', label: '背景', type: 'text', value: '', placeholder: '背景的相对路径' },
    description: { id: 'description', label: '描述', type: 'text', value: '', placeholder: '简短的描述' },
    version: { id: 'version', label: '版本', type: 'text', value: '', placeholder: '版本号' },
    author: { id: 'author', label: '作者', type: 'text', value: '', placeholder: '作者' },
    homepage: { id: 'homepage', label: '主页', type: 'text', value: '', placeholder: '作者主页' }
} as const satisfies Readonly<PromptFieldObject>;
Object.freeze(DefaultFields);
export const ExtractDefaultFields = (fields: Readonly<PromptFieldObject>) =>
    Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, value.value])) as {
        name: string;
        cover: string;
        description: string;
        version: string;
        author: string;
        homepage: string;
    };

export const usePromptStore = defineStore('prompt', () => {
    const visable = ref(false);
    const title = ref('');
    const prompt = ref('');
    const fields = ref<PromptFieldObject>({});
    const waitingForSubmit: ((value: boolean | PromiseLike<boolean>) => void)[] = [];

    function show(title_: string, prompt_: string, fields_: PromptFieldObject): Promise<boolean> {
        return new Promise((resolve) => {
            title.value = title_;
            prompt.value = prompt_;
            fields.value = { ...fields_ };
            visable.value = true;
            waitingForSubmit.push(resolve);
        });
    }

    function submit(ok: boolean): void {
        visable.value = false;
        waitingForSubmit.forEach((callback) => callback(ok));
    }

    return {
        visable: computed(() => visable.value),
        title: computed(() => title.value),
        prompt: computed(() => prompt.value),
        fields,
        show,
        submit
    };
});
