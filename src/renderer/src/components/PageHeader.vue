<template>
    <header class="px-3 py-2 flex shrink-0 items-center justify-between gap-3 border-b border-light-950/8">
        <div class="min-w-0">
            <h2 class="truncate text-lg font-bold text-light-950/80">
                <slot name="title"></slot>
            </h2>
            <p v-if="$slots.subtitle" class="truncate text-sm text-light-950/45">
                <slot name="subtitle"></slot>
            </p>
        </div>
        <div v-if="$slots.right" class="flex gap-2">
            <slot name="right"></slot>
        </div>
    </header>
</template>
