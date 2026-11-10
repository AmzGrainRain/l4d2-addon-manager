import type { SettingsManager } from '../setting';
import { shell } from 'electron';
import { join } from 'node:path';
import type { Steam } from '../steam';

export const getGameHandlers = (steam: Steam, settingsManager: SettingsManager) => ({
    'game:get-directories': () => settingsManager.current().gameDirectories,
    'game:save-executable': (_event: Electron.IpcMainInvokeEvent, selectedPath: string) => settingsManager.setGameExecutable(selectedPath),
    'game:auto-detect': () => {
        const installDirectory = steam.getAppInstallDir(550);
        if (!installDirectory) throw new Error('Steam 未找到 Left 4 Dead 2 的安装目录');
        return settingsManager.setGameExecutable(join(installDirectory, 'left4dead2.exe'));
    },
    'game:open-directory': async (_event: Electron.IpcMainInvokeEvent, directoryType: 'workshop' | 'addon') => {
        const directories = settingsManager.current().gameDirectories;
        const directory = directoryType === 'workshop' ? directories.workshopDirectory : directories.addonDirectory;
        if (!directory) throw new Error('请先在设置中选择 Left 4 Dead 2 游戏目录');
        const error = await shell.openPath(directory);
        if (error) throw new Error(error);
    }
});
