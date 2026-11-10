<template>
    <div v-bind="$attrs" class="flex items-center gap-3">
        <button class="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-light-950/10 text-lg hover:bg-light-950/5 disabled:cursor-default disabled:opacity-45" type="button" :aria-label="`${label} -`" :disabled="decrementDisabled" @click="emits('update:modelValue', Math.max(min ?? -Infinity, modelValue - step))">−</button>
        <output class="min-w-18 text-center text-lg font-bold tabular-nums">
            <slot>{{ modelValue }}{{ suffix ? ` ${suffix}` : '' }}</slot>
        </output>
        <button class="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-light-950/10 text-lg hover:bg-light-950/5 disabled:cursor-default disabled:opacity-45" type="button" :aria-label="`${label} +`" :disabled="incrementDisabled" @click="emits('update:modelValue', Math.min(max ?? Infinity, modelValue + step))">+</button>
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
