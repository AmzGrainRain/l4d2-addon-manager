import { convertLocalItemToWorkshop, deleteWorkshopItem, exportWorkshopItems, listWorkshopItems, localizeWorkshopItem, moveWorkshopItem } from '../workshop';
import type { WorkshopState, WorkshopItem } from '../../shared/workshop';
import { Steam } from '../steam';
import type { SettingsManager } from '../setting';

export const getWorkshopHandlers = (steam: Steam, settingsManager: SettingsManager) => ({
    'workshop:list': (_event: Electron.IpcMainInvokeEvent, state: WorkshopState) => listWorkshopItems(state, settingsManager),
    'workshop:export': (_event: Electron.IpcMainInvokeEvent, state: WorkshopState, items: Pick<WorkshopItem, 'id' | 'source'>[], outputPath: string) => exportWorkshopItems(state, items, outputPath, settingsManager),
    'workshop:disable': async (_event: Electron.IpcMainInvokeEvent, id: string, source: WorkshopItem['source']) => {
        await moveWorkshopItem(id, source, settingsManager);
        if (source === 'installed') return;
        try {
            if (await steam.setSubscribed(id, false)) return;
            throw new Error('Steam failed to unsubscribe from this Workshop item');
        } catch (error) {
            try {
                await moveWorkshopItem(id, source, settingsManager, true);
            } catch (rollbackError) {
                throw new AggregateError([error, rollbackError], 'Unsubscribe failed and the Workshop files could not be restored');
            }
            throw error;
        }
    },
    'workshop:restore': async (_event: Electron.IpcMainInvokeEvent, id: string, source: WorkshopItem['source']) => {
        await moveWorkshopItem(id, source, settingsManager, true);
        if (source === 'installed') return;
        try {
            if (await steam.setSubscribed(id, true)) return;
            throw new Error('Steam failed to resubscribe to this Workshop item');
        } catch (error) {
            try {
                await moveWorkshopItem(id, source, settingsManager, false);
            } catch (rollbackError) {
                throw new AggregateError([error, rollbackError], 'Resubscribe failed and the restored Workshop files could not be disabled again');
            }
            throw error;
        }
    },
    'workshop:localize': (_event: Electron.IpcMainInvokeEvent, id: string) => localizeWorkshopItem(id, settingsManager, () => steam.setSubscribed(id, false)),
    'workshop:convert-to-workshop': (_event: Electron.IpcMainInvokeEvent, id: string) => convertLocalItemToWorkshop(id, settingsManager, () => steam.setSubscribed(id, true), () => steam.setSubscribed(id, false)),
    'workshop:delete': (_event: Electron.IpcMainInvokeEvent, id: string, source: WorkshopItem['source']) => deleteWorkshopItem(id, source, settingsManager)
});
