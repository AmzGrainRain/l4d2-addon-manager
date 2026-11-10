<template>
    <a v-if="href" v-bind="$attrs" :href="href" :target="target" :class="buttonVariantClass[variant]" class="cursor-pointer rounded-xl border px-3 py-1.5 text-sm font-semibold duration-100">
        <slot />
    </a>
    <button v-else v-bind="$attrs" :type="type" :disabled="disabled" :class="buttonVariantClass[variant]" class="cursor-pointer rounded-xl border px-3 py-1.5 text-sm font-semibold duration-100 disabled:cursor-default disabled:opacity-45">
        <slot />
    </button>
</template>

<script lang="ts" setup>
import { buttonVariantClass, type ButtonVariant } from './buttonClasses';

defineOptions({
    inheritAttrs: false
});

withDefaults(
    defineProps<{
        variant?: ButtonVariant;
        type?: 'button' | 'submit' | 'reset';
        disabled?: boolean;
        href?: string;
        target?: string;
    }>(),
    {
        variant: 'secondary',
        type: 'button',
        disabled: false,
        href: '',
        target: ''
    }
);
</script>
