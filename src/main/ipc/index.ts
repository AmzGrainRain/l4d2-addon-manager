import { BrowserWindow, ipcMain, type IpcMainInvokeEvent } from 'electron';
import { getDialogHandlers } from './dialog';
import { getGameHandlers } from './game';
import { getWindowHandlers } from './window';
import { getWorkshopHandlers } from './workshop';
import { getAliasHandlers } from './aliases';
import type { Steam } from '../steam';
import type { SettingsManager } from '../setting';

export const createMainIPCHandlers = (steam: Steam, settingsManager: SettingsManager) => ({
    ...getWindowHandlers(),
    ...getWorkshopHandlers(steam, settingsManager),
    ...getGameHandlers(steam, settingsManager),
    ...getDialogHandlers(),
    ...getAliasHandlers()
});

export type IPC_HANDLERS_MAP_T = ReturnType<typeof createMainIPCHandlers>;

export const registerMainIPCHandlers = (steam: Steam, settingsManager: SettingsManager) => {
    const handlers = createMainIPCHandlers(steam, settingsManager);
    for (const channel of Object.keys(handlers) as (keyof typeof handlers)[]) {
        ipcMain.handle(channel, (event, ...args) => {
            const window = BrowserWindow.fromWebContents(event.sender);
            if (!window || window.webContents !== event.sender || event.senderFrame !== event.sender.mainFrame) throw new Error('Only the app window main frame can use this IPC');
            return (handlers[channel] as (event: IpcMainInvokeEvent, ...args: unknown[]) => unknown)(event, ...args);
        });
    }
};
