<template>
    <label :class="['flex flex-col gap-1 text-xs font-semibold text-light-950/55', wrapperClass]">
        <span v-if="label">{{ label }}</span>
        <textarea v-bind="$attrs" :value="modelValue" @input="emits('update:modelValue', ($event.target as HTMLTextAreaElement).value)" :class="textareaClass"></textarea>
    </label>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

defineOptions({
    inheritAttrs: false
});

const props = withDefaults(
    defineProps<{
        modelValue?: string | null;
        label?: string;
        wrapperClass?: string;
        textareaClass?: string;
    }>(),
    {
        modelValue: '',
        label: '',
        wrapperClass: '',
        textareaClass: ''
    }
);

const emits = defineEmits<{
    'update:modelValue': [value: string];
}>();

const textareaClass = computed(() => ['h-72 resize-none rounded-2xl border border-light-950/10 bg-light-50 p-3 text-sm text-light-950/75 outline-accent', props.textareaClass]);

</script>
