import type { IPC_HANDLERS_MAP_T } from '../main/ipc';

type ExtractArgs<T> = T extends (event: any, ...args: infer P) => any ? P : never;
type ExtractReturn<T> = T extends (...args: any[]) => infer R ? Awaited<R> : never;
type MainIPCInvoke<K extends keyof IPC_HANDLERS_MAP_T> = (...args: ExtractArgs<IPC_HANDLERS_MAP_T[K]>) => Promise<ExtractReturn<IPC_HANDLERS_MAP_T[K]>>;

export interface API {
    window: {
        minimize: MainIPCInvoke<'window:minimize'>;
        maximize: MainIPCInvoke<'window:maximize'>;
        close: MainIPCInvoke<'window:close'>;
        isMaximized: MainIPCInvoke<'window:is-maximized'>;
        openDevTools: MainIPCInvoke<'window:open-devtools'>;
        onStateChanged: (listener: (maximized: boolean) => void) => () => void;
    };
    workshop: {
        list: MainIPCInvoke<'workshop:list'>;
        export: MainIPCInvoke<'workshop:export'>;
        disable: MainIPCInvoke<'workshop:disable'>;
        restore: MainIPCInvoke<'workshop:restore'>;
        delete: MainIPCInvoke<'workshop:delete'>;
        localize: MainIPCInvoke<'workshop:localize'>;
        convertToWorkshop: MainIPCInvoke<'workshop:convert-to-workshop'>;
    };
    game: {
        getDirectories: MainIPCInvoke<'game:get-directories'>;
        saveExecutable: MainIPCInvoke<'game:save-executable'>;
        autoDetect: MainIPCInvoke<'game:auto-detect'>;
        openDirectory: MainIPCInvoke<'game:open-directory'>;
    };
    dialog: {
        open: MainIPCInvoke<'dialog:open'>;
        save: MainIPCInvoke<'dialog:save'>;
    };
    aliases: {
        importCsv: MainIPCInvoke<'aliases:import-csv'>;
        exportCsv: MainIPCInvoke<'aliases:export-csv'>;
    };
}
