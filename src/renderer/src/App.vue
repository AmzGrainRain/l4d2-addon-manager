<template>
    <div class="relative flex size-full flex-col gap-2">
        <TitleBar />
        <div class="flex flex-1 gap-2 min-h-0">
            <SideBar />
            <main class="panel-light-50 relative flex-1 min-w-0 overflow-auto">
                <RouterView v-slot="{ Component }">
                    <Transition name="page" mode="out-in">
                        <component :is="Component" />
                    </Transition>
                </RouterView>
                <Loading />
            </main>
        </div>
        <Prompt />
    </div>
</template>

<script setup lang="ts">
import TitleBar from './components/TitleBar.vue';
import SideBar from './components/SideBar.vue';
import Prompt from './components/Prompt.vue';
import Loading from './components/Loading.vue';
</script>

