<template>
    <div class="flex size-full min-h-0 flex-col">
        <PageHeader>
            <template #title>{{ $t('navigation.about') }}</template>
            <template #subtitle>{{ $t('about.subtitle') }}</template>
        </PageHeader>
        <section class="min-h-0 flex-1 overflow-y-auto p-4">
            <div class="f-full space-y-4">
                <div class="rounded-2xl border border-light-950/8 bg-light-100 p-5 sm:p-7">
                    <div class="flex items-center gap-4">
                        <img :src="appIcon" alt="" class="size-12 shrink-0 rounded-xl object-cover" />
                        <div class="min-w-0">
                            <h2 class="text-lg font-bold text-light-950/85">{{ $t('app.title') }}</h2>
                            <p class="mt-1 text-sm leading-6 text-light-950/55">{{ $t('about.content') }}</p>
                        </div>
                    </div>
                </div>

                <div class="grid gap-3 sm:grid-cols-2">
                    <article class="rounded-xl border border-light-950/8 bg-light-50 p-4">
                        <div class="flex items-center gap-3">
                            <span class="grid size-9 place-items-center rounded-lg bg-accent/10 text-accent"><BsLayers class="size-4.5" /></span>
                            <h3 class="font-semibold text-light-950/80">{{ $t('about.manageTitle') }}</h3>
                        </div>
                        <p class="mt-3 text-sm leading-6 text-light-950/55">{{ $t('about.manage') }}</p>
                    </article>
                    <article class="rounded-xl border border-light-950/8 bg-light-50 p-4">
                        <div class="flex items-center gap-3">
                            <span class="grid size-9 place-items-center rounded-lg bg-accent/10 text-accent"><BsArrowLeftRight class="size-4.5" /></span>
                            <h3 class="font-semibold text-light-950/80">{{ $t('about.transferTitle') }}</h3>
                        </div>
                        <p class="mt-3 text-sm leading-6 text-light-950/55">{{ $t('about.transfer') }}</p>
                    </article>
                    <article class="rounded-xl border border-light-950/8 bg-light-50 p-4">
                        <div class="flex items-center gap-3">
                            <span class="grid size-9 place-items-center rounded-lg bg-accent/10 text-accent"><BsArchive class="size-4.5" /></span>
                            <h3 class="font-semibold text-light-950/80">{{ $t('about.exportTitle') }}</h3>
                        </div>
                        <p class="mt-3 text-sm leading-6 text-light-950/55">{{ $t('about.export') }}</p>
                    </article>
                    <article class="rounded-xl border border-light-950/8 bg-light-50 p-4">
                        <div class="flex items-center gap-3">
                            <span class="grid size-9 place-items-center rounded-lg bg-accent/10 text-accent"><BsSliders class="size-4.5" /></span>
                            <h3 class="font-semibold text-light-950/80">{{ $t('about.settingsTitle') }}</h3>
                        </div>
                        <p class="mt-3 text-sm leading-6 text-light-950/55">{{ $t('about.settings') }}</p>
                    </article>
                </div>

                <a
                    href="https://github.com/AmzGrainRain/l4d2-addon-manager"
                    target="_blank"
                    rel="noreferrer"
                    class="flex items-center justify-between gap-4 rounded-xl border border-light-950/8 bg-light-50 p-4 transition-colors hover:border-accent/30 hover:bg-light-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                    <div class="flex min-w-0 items-center gap-3">
                        <span class="grid size-9 shrink-0 place-items-center rounded-lg bg-light-950/5 text-light-950/70"><BsGithub class="size-4.5" /></span>
                        <div class="min-w-0">
                            <h3 class="text-sm font-semibold text-light-950/80">{{ $t('about.repository') }}</h3>
                            <p class="truncate text-sm text-light-950/45">github.com/AmzGrainRain/l4d2-addon-manager</p>
                        </div>
                    </div>
                    <BsBoxArrowUpRight class="size-4 shrink-0 text-light-950/45" aria-hidden="true" />
                </a>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import PageHeader from '../components/PageHeader.vue';
import { BsLayers, BsArrowLeftRight, BsArchive, BsSliders, BsGithub, BsBoxArrowUpRight } from 'vue-icons-plus/bs';
import appIcon from '../assets/l4d2am-icon.png';
</script>
