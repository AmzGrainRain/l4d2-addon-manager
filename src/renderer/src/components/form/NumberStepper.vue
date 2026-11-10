<template>
    <div v-bind="$attrs" class="rounded-xl border border-light-950/10 p-3">
        <p class="text-sm font-semibold">{{ label }}</p>
        <div class="mt-3 flex items-center justify-between gap-3">
            <button class="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-light-950/10 text-lg hover:bg-light-950/5 disabled:cursor-default disabled:opacity-45" type="button" :aria-label="`${label} -`" :disabled="decrementDisabled" @click="emits('update:modelValue', Math.max(min ?? -Infinity, modelValue - step))">−</button>
            <output class="text-lg font-bold tabular-nums">{{ modelValue }}{{ suffix ? ` ${suffix}` : '' }}</output>
            <button class="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-light-950/10 text-lg hover:bg-light-950/5 disabled:cursor-default disabled:opacity-45" type="button" :aria-label="`${label} +`" :disabled="incrementDisabled" @click="emits('update:modelValue', Math.min(max ?? Infinity, modelValue + step))">+</button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

defineOptions({
    inheritAttrs: false
});

const props = withDefaults(
    defineProps<{
        modelValue: number;
        label: string;
        suffix?: string;
        min?: number;
        max?: number;
        step?: number;
        disabled?: boolean;
    }>(),
    {
        suffix: '',
        step: 1,
        disabled: false
    }
);

const emits = defineEmits<{
    'update:modelValue': [value: number];
}>();

const decrementDisabled = computed(() => props.disabled || (props.min !== undefined && props.modelValue <= props.min));
const incrementDisabled = computed(() => props.disabled || (props.max !== undefined && props.modelValue >= props.max));
</script>
