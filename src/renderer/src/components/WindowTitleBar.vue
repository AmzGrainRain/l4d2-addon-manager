<template>
    <header class="panel-light-50 flex h-16 shrink-0 items-center">
        <div class="flex h-full shrink-0 items-center">
            <slot name="left" />
        </div>
        <div class="h-full flex-1 [app-region:drag]" />
        <div class="flex h-full shrink-0 items-center gap-4 px-6">
            <slot name="right" />
        </div>
    </header>
</template>
