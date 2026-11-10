import { createRouter, createWebHashHistory } from 'vue-router';
import Synced from './pages/Synced.vue';
import Installed from './pages/Installed.vue';
import Disabled from './pages/Disabled.vue';
import About from './pages/About.vue';
import Settings from './pages/Settings.vue';

declare module 'vue-router' {
    interface RouteMeta {
        title: string;
        description: string;
        icon?: 'synced' | 'disabled' | 'installed' | 'about' | 'settings';
        position?: 'top' | 'bottom';
    }
}

export const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        { path: '/', name: 'synced', component: Synced, meta: { title: 'workshop.synced', description: 'workshop.syncedDescription', icon: 'synced', position: 'top' } },
        { path: '/installed', name: 'installed', component: Installed, meta: { title: 'workshop.installed', description: 'workshop.installedDescription', icon: 'installed', position: 'top' } },
        { path: '/disabled', name: 'disabled', component: Disabled, meta: { title: 'workshop.disabled', description: 'workshop.disabledDescription', icon: 'disabled', position: 'top' } },
        { path: '/settings', name: 'settings', component: Settings, meta: { title: 'navigation.settings', description: 'settings.description', icon: 'settings', position: 'bottom' } },
        { path: '/about', name: 'about', component: About, meta: { title: 'navigation.about', description: 'about.description', icon: 'about', position: 'bottom' } }
    ]
});
