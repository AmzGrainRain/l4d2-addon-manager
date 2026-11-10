import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { WorkshopItem, WorkshopState } from '../../../shared/workshop';

export const useWorkshopStore = defineStore('workshop', () => {
    const items = ref<Record<WorkshopState, Record<string, WorkshopItem>>>({ synced: {}, disabled: {}, installed: {} });
    const aliases = ref<Record<string, string>>({});
    try {
        const savedAliases: unknown = JSON.parse(localStorage.getItem('workshop-aliases') ?? '{}');
        if (!savedAliases || typeof savedAliases !== 'object' || Array.isArray(savedAliases)) throw new Error('Invalid saved aliases');
        aliases.value = Object.fromEntries(Object.entries(savedAliases).filter(([id, alias]) => /^\d+$/.test(id) && typeof alias === 'string' && alias.trim()).map(([id, alias]) => [id, (alias as string).trim()]));
    } catch {
        localStorage.removeItem('workshop-aliases');
    }

    const refresh = async (state: WorkshopState) => {
        const list = await window.api.workshop.list(state);
        items.value[state] = Object.fromEntries(list.map((item) => [item.id, item]));
    };

    const setAlias = (id: string, alias: string) => {
        const value = alias.trim();
        if (value) aliases.value[id] = value;
        else delete aliases.value[id];
        localStorage.setItem('workshop-aliases', JSON.stringify(aliases.value));
    };

    const importAliases = (entries: { id: string; alias: string }[]) => {
        const importedAliases = { ...aliases.value };
        for (const { id, alias } of entries) {
            const value = alias.trim();
            if (value) importedAliases[id] = value;
            else delete importedAliases[id];
        }
        aliases.value = importedAliases;
        localStorage.setItem('workshop-aliases', JSON.stringify(aliases.value));
    };

    const clearAliases = () => {
        aliases.value = {};
        localStorage.removeItem('workshop-aliases');
    };

    return { items, aliases, refresh, setAlias, importAliases, clearAliases };
});
