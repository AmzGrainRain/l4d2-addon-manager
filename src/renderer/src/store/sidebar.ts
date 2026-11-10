import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSidebarStore = defineStore('sidebar', () => {
    const expanded = ref(localStorage.getItem('sidebar-expanded') === 'true');
    const setExpanded = (value: boolean) => {
        expanded.value = value;
        localStorage.setItem('sidebar-expanded', String(value));
    };

    return { expanded, setExpanded };
});
