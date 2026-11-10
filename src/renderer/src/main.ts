import { createApp } from 'vue';
import App from './App.vue';
import { router } from './routes';
import { createPinia } from 'pinia';
import i18n from './locales';
import { useThemeStore } from './store/theme';
import './style.css';

const pinia = createPinia();
useThemeStore(pinia);
createApp(App).use(pinia).use(i18n).use(router).mount('#app');
