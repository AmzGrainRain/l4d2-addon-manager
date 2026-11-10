import { app, BrowserWindow, dialog, Menu, protocol, shell } from 'electron';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readWorkshopPreview } from './workshop';
import type { WorkshopPreviewState } from '../shared/workshop';
import { registerMainIPCHandlers } from './ipc';
import { Steam } from './steam';
import { SettingsManager } from './setting';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const steam = new Steam();
const applicationDirectory = app.isPackaged ? dirname(app.getPath('exe')) : app.getAppPath();
const settingsManager = new SettingsManager(applicationDirectory, join(app.getPath('appData'), 'l4dmm', 'settings', 'settings.json'));

protocol.registerSchemesAsPrivileged([
    { scheme: 'workshop-preview', privileges: { standard: true, secure: true, stream: true } }
]);

const createWindow = () => {
    const window = new BrowserWindow({
        width: 1280,
        height: 800,
        icon: join(app.getAppPath(), 'resources', 'icon.ico'),
        minWidth: 1024,
        minHeight: 640,
        show: false,
        autoHideMenuBar: true,
        frame: false,
        titleBarStyle: 'hidden',
        webPreferences: {
            preload: join(currentDirectory, '../preload/index.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true
        }
    });

    window.once('ready-to-show', () => window.show());
    window.on('maximize', () => window.webContents.send('window:state-changed', true));
    window.on('unmaximize', () => window.webContents.send('window:state-changed', false));
    window.webContents.setWindowOpenHandler(({ url }) => {
        if (url === 'https://github.com/AmzGrainRain/l4d2-addon-manager') void shell.openExternal(url);
        return { action: 'deny' };
    });

    if (process.env.ELECTRON_RENDERER_URL) {
        void window.loadURL(process.env.ELECTRON_RENDERER_URL);
    } else {
        void window.loadFile(join(currentDirectory, '../renderer/index.html'));
    }
};

void app.whenReady().then(async () => {
    await settingsManager.load();
    try {
        steam.init(550);
    } catch (error) {
        console.error('Steamworks initialization failed', error);
        dialog.showErrorBox(
            'Steamworks 初始化失败',
            '应用需要 Steamworks 正常运行才能启动。请确认 Steam 已启动、Left 4 Dead 2 已安装，并且 Steamworks SDK 运行库可用。'
        );
        app.quit();
        return;
    }
    registerMainIPCHandlers(steam, settingsManager);
    protocol.handle('workshop-preview', async (request) => {
        const url = new URL(request.url);
        const state = url.hostname;
        const id = url.pathname.slice(1);
        if (request.method !== 'GET' || !(['synced', 'installed', 'disabled-synced', 'disabled-installed'] as WorkshopPreviewState[]).includes(state as WorkshopPreviewState) || !/^\d+$/.test(id) || url.search || url.hash) return new Response('Bad request', { status: 400 });
        try {
            const preview = await readWorkshopPreview(id, state as WorkshopPreviewState, settingsManager);
            return new Response(new Uint8Array(preview), { headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'no-store' } });
        } catch {
            return new Response('Not found', { status: 404 });
        }
    });
    Menu.setApplicationMenu(null);
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('before-quit', () => steam.reset());

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
