import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export type Theme = 'system' | 'light' | 'dark';
type ResolvedTheme = Exclude<Theme, 'system'>;
export type AccentColor = 'orange' | 'red' | 'pink' | 'purple' | 'indigo' | 'blue' | 'cyan' | 'teal' | 'green' | 'lime' | 'amber';

const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
const resolveTheme = (theme: Theme): ResolvedTheme => theme === 'system' ? (systemThemeQuery.matches ? 'dark' : 'light') : theme;
const cachedTheme = localStorage.getItem('theme');
const initialPreference: Theme = cachedTheme === 'dark' || cachedTheme === 'system' ? cachedTheme : 'light';
const cachedAccentColor = localStorage.getItem('accent-color');
const initialAccentColor: AccentColor = cachedAccentColor === 'orange' || cachedAccentColor === 'red' || cachedAccentColor === 'pink' || cachedAccentColor === 'purple' || cachedAccentColor === 'indigo' || cachedAccentColor === 'blue' || cachedAccentColor === 'cyan' || cachedAccentColor === 'teal' || cachedAccentColor === 'green' || cachedAccentColor === 'lime' || cachedAccentColor === 'amber' ? cachedAccentColor : 'red';
const initialTheme = resolveTheme(initialPreference);
document.documentElement.dataset.theme = initialTheme;
document.documentElement.dataset.accentColor = initialAccentColor;

export const useThemeStore = defineStore('theme', () => {
    const preference = ref<Theme>(initialPreference);
    const current = ref<ResolvedTheme>(initialTheme);
    const accentColor = ref<AccentColor>(initialAccentColor);
    const followsSystem = computed(() => preference.value === 'system');

    const apply = (theme: Theme) => {
        preference.value = theme;
        current.value = resolveTheme(theme);
        document.documentElement.dataset.theme = current.value;
        localStorage.setItem('theme', theme);
    };

    const applyAccentColor = (color: AccentColor) => {
        accentColor.value = color;
        document.documentElement.dataset.accentColor = color;
        localStorage.setItem('accent-color', color);
    };

    systemThemeQuery.addEventListener('change', () => {
        if (!followsSystem.value) return;
        current.value = resolveTheme('system');
        document.documentElement.dataset.theme = current.value;
    });

    return { preference, current, accentColor, apply, applyAccentColor };
});
