import { contextBridge, ipcRenderer } from 'electron';
import type { API } from './api';
import type { IPC_HANDLERS_MAP_T } from '../main/ipc';

type ExtractArgs<T> = T extends (event: any, ...args: infer P) => any ? P : never;
type ExtractReturn<T> = T extends (...args: any[]) => infer R ? Awaited<R> : never;
const ipcInvoke = <K extends keyof IPC_HANDLERS_MAP_T>(channel: K, ...args: ExtractArgs<IPC_HANDLERS_MAP_T[K]>): Promise<ExtractReturn<IPC_HANDLERS_MAP_T[K]>> =>
    ipcRenderer.invoke(channel, ...args) as Promise<ExtractReturn<IPC_HANDLERS_MAP_T[K]>>;

const api: API = {
    window: {
        minimize: () => ipcInvoke('window:minimize'),
        maximize: () => ipcInvoke('window:maximize'),
        close: () => ipcInvoke('window:close'),
        isMaximized: () => ipcInvoke('window:is-maximized'),
        openDevTools: () => ipcInvoke('window:open-devtools'),
        onStateChanged: (listener) => {
            const wrapped = (_event: Electron.IpcRendererEvent, maximized: boolean) => listener(maximized);
            ipcRenderer.on('window:state-changed', wrapped);
            return () => ipcRenderer.removeListener('window:state-changed', wrapped);
        }
    },
    workshop: {
        list: (state) => ipcInvoke('workshop:list', state),
        export: (state, items, outputPath) => ipcInvoke('workshop:export', state, items, outputPath),
        disable: (id, source) => ipcInvoke('workshop:disable', id, source),
        restore: (id, source) => ipcInvoke('workshop:restore', id, source),
        delete: (id, source) => ipcInvoke('workshop:delete', id, source),
        localize: (id) => ipcInvoke('workshop:localize', id),
        convertToWorkshop: (id) => ipcInvoke('workshop:convert-to-workshop', id)
    },
    game: {
        getDirectories: () => ipcInvoke('game:get-directories'),
        saveExecutable: (selectedPath) => ipcInvoke('game:save-executable', selectedPath),
        autoDetect: () => ipcInvoke('game:auto-detect'),
        openDirectory: (directoryType) => ipcInvoke('game:open-directory', directoryType)
    },
    dialog: {
        open: (options) => ipcInvoke('dialog:open', options),
        save: (options) => ipcInvoke('dialog:save', options)
    },
    aliases: {
        importCsv: (inputPath) => ipcInvoke('aliases:import-csv', inputPath),
        exportCsv: (aliases, outputPath) => ipcInvoke('aliases:export-csv', aliases, outputPath)
    }
};

contextBridge.exposeInMainWorld('api', api);
