import { BrowserWindow, type IpcMainInvokeEvent } from 'electron';

export const getWindowHandlers = () => ({
    'window:minimize': (event: IpcMainInvokeEvent) => BrowserWindow.fromWebContents(event.sender)?.minimize(),
    'window:maximize': (event: IpcMainInvokeEvent) => {
        const window = BrowserWindow.fromWebContents(event.sender);
        if (!window) return;
        if (window.isMaximized()) window.unmaximize();
        else window.maximize();
    },
    'window:close': (event: IpcMainInvokeEvent) => BrowserWindow.fromWebContents(event.sender)?.close(),
    'window:is-maximized': (event: IpcMainInvokeEvent) => BrowserWindow.fromWebContents(event.sender)?.isMaximized() ?? false,
    'window:open-devtools': (event: IpcMainInvokeEvent) => BrowserWindow.fromWebContents(event.sender)?.webContents.openDevTools()
});
