<template>
    <label :class="['flex flex-col gap-1 text-xs font-semibold text-light-950/55', wrapperClass]">
        <span v-if="label">{{ label }}</span>
        <input v-bind="$attrs" :type="type" :value="modelValue" @input="emits('update:modelValue', ($event.target as HTMLInputElement).value)" class="h-9 rounded-xl border border-light-950/10 bg-light-50 px-3 text-sm text-light-950/75 outline-accent" />
    </label>
</template>

<script lang="ts" setup>
defineOptions({
    inheritAttrs: false
});

withDefaults(
    defineProps<{
        modelValue?: string | number | null;
        label?: string;
        type?: string;
        wrapperClass?: string;
    }>(),
    {
        modelValue: '',
        label: '',
        type: 'text',
        wrapperClass: ''
    }
);

const emits = defineEmits<{
    'update:modelValue': [value: string];
}>();

</script>
