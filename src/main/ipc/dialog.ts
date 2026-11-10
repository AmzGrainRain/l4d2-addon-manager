import { dialog, type OpenDialogOptions, type SaveDialogOptions } from 'electron';

export const getDialogHandlers = () => ({
    'dialog:open': (_event: Electron.IpcMainInvokeEvent, options: OpenDialogOptions) => dialog.showOpenDialog(options),
    'dialog:save': (_event: Electron.IpcMainInvokeEvent, options: SaveDialogOptions) => dialog.showSaveDialog(options)
});
