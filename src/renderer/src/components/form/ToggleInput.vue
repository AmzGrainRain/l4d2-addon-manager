<template>
    <button
        v-bind="$attrs"
        :class="['relative h-7 w-12 shrink-0 cursor-pointer rounded-full duration-150 disabled:cursor-default disabled:opacity-45', modelValue ? 'bg-accent' : 'bg-light-950/15']"
        type="button"
        role="switch"
        :aria-checked="modelValue"
        :disabled="disabled"
        @click="emits('update:modelValue', !modelValue)"
    >
        <span :class="['absolute top-1 size-5 rounded-full bg-light-50 shadow-sm duration-150', modelValue ? 'left-6' : 'left-1']" />
    </button>
</template>

<script lang="ts" setup>
defineOptions({
    inheritAttrs: false
});

withDefaults(
    defineProps<{
        modelValue: boolean;
        disabled?: boolean;
    }>(),
    {
        disabled: false
    }
);

const emits = defineEmits<{
    'update:modelValue': [value: boolean];
}>();
</script>
