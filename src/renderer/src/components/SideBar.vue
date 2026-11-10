<template>
    <div id="navigation-bar" class="group flex h-full shrink-0 flex-col transition-[width] duration-200 ease-in-out" :style="{ width: isExpanded ? '9.5rem' : '4rem' }" @mouseenter="hovered = true" @mouseleave="hovered = false">
        <nav class="panel-light-50 flex h-full w-full flex-col justify-between p-1"
            :aria-label="$t('navigation.label')">
            <ul v-for="(items, position) in [topMenuItems, bottomMenuItems]" :key="position"
                class="flex flex-col gap-1 font-semibold">
                <li v-for="item in items" :key="item.path">
                    <RouterLink
                        :to="item.path"
                        exact-active-class="activated"
                        :title="$t(item.meta.title)"
                        :aria-label="$t(item.meta.title)"
                        class="flex h-10 items-center justify-start overflow-hidden rounded text-inherit no-underline transition-[background-color,color,padding-left,gap] duration-200 ease-in-out hover:bg-accent hover:text-white focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent [&.activated]:bg-accent [&.activated]:text-white"
                        :class="isExpanded ? 'gap-3 pl-3' : 'gap-0 pl-[1.125rem]'"
                    >
                        <component :is="item.meta.icon ? icons[item.meta.icon] : undefined"
                            class="size-5 shrink-0"
                            aria-hidden="true" />
                        <span class="min-w-0 overflow-hidden truncate whitespace-nowrap transition-[max-width] duration-200"
                            :class="isExpanded ? 'max-w-31' : 'max-w-0'">{{ $t(item.meta.title) }}</span>
                    </RouterLink>
                </li>
            </ul>
        </nav>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { BsSteam, BsSlashCircleFill, BsBoxSeamFill, BsInfoCircle, BsGearWideConnected } from 'vue-icons-plus/bs';
import { useSidebarStore } from '../store/sidebar';

const router = useRouter();
const sidebarStore = useSidebarStore();
const hovered = ref(false);
const isExpanded = computed(() => sidebarStore.expanded || hovered.value);
const icons = { synced: BsSteam, disabled: BsSlashCircleFill, installed: BsBoxSeamFill, about: BsInfoCircle, settings: BsGearWideConnected };
const topOrder = ['synced', 'installed', 'disabled'];
const visibleMenuItems = computed(() => router.getRoutes().filter((route) => route.meta.icon));
const topMenuItems = computed(() => visibleMenuItems.value.filter((route) => route.meta.position === 'top').sort((a, b) => topOrder.indexOf(String(a.name)) - topOrder.indexOf(String(b.name))));
const bottomMenuItems = computed(() => visibleMenuItems.value.filter((route) => route.meta.position !== 'top'));
</script>
