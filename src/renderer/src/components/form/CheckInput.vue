<template>
    <label class="flex items-center gap-2 pt-5 text-xs font-semibold text-light-950/60">
        <input v-bind="$attrs" :checked="modelValue" @change="emits('update:modelValue', ($event.target as HTMLInputElement).checked)" type="checkbox" class="accent-accent" />
        <span v-if="label">{{ label }}</span>
    </label>
</template>

<script lang="ts" setup>
defineOptions({
    inheritAttrs: false
});

defineProps<{
    modelValue: boolean;
    label?: string;
}>();

const emits = defineEmits<{
    'update:modelValue': [value: boolean];
}>();

</script>
