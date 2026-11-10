import { EventEmitter } from 'node:events';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { GameDirectories } from '../../shared/workshop';

export interface Settings {
    gameDirectories: GameDirectories;
}

export type SettingsManagerEvents = {
    changed: [settings: Settings, previousSettings: Settings];
};

const DEFAULT_SETTINGS: Settings = { gameDirectories: { executablePath: '', workshopDirectory: '', addonDirectory: '' } };

const normalizeSettings = (value: unknown): Settings => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return structuredClone(DEFAULT_SETTINGS);
    const rawDirectories = (value as Partial<Settings>).gameDirectories;
    if (!rawDirectories || typeof rawDirectories !== 'object') return structuredClone(DEFAULT_SETTINGS);
    const { executablePath, workshopDirectory, addonDirectory } = rawDirectories as GameDirectories;
    if (![executablePath, workshopDirectory, addonDirectory].every((entry) => typeof entry === 'string' && (!entry || path.isAbsolute(entry)))) return structuredClone(DEFAULT_SETTINGS);
    return { gameDirectories: { executablePath, workshopDirectory, addonDirectory } };
};

const serializeSettings = (settings: Settings): string => JSON.stringify(settings, null, 4);

export class SettingsManager extends EventEmitter<SettingsManagerEvents> {
    private readonly settingsFile: string;
    private readonly legacySettingsFile: string | undefined;
    private settingsSaveQueue: Promise<void> = Promise.resolve();
    private settingsCache: Settings | undefined;
    private settingsSnapshot: Settings | undefined;

    constructor(settingsDirectory: string, legacySettingsFile?: string) {
        super();
        this.settingsFile = path.join(settingsDirectory, 'settings.json');
        this.legacySettingsFile = legacySettingsFile;
    }

    async load(): Promise<Settings> {
        return this.queueSave(async () => {
            await this.read();
            return this.current();
        });
    }

    current(): Settings {
        if (!this.settingsSnapshot) throw new Error('Settings have not been loaded');
        return structuredClone(this.settingsSnapshot);
    }

    async setGameExecutable(selectedPath: string): Promise<GameDirectories> {
        if (!path.isAbsolute(selectedPath)) throw new Error('Invalid game executable path');
        const executablePath = path.resolve(selectedPath);
        if (path.basename(executablePath).toLowerCase() !== 'left4dead2.exe') throw new Error('请选择 left4dead2.exe');
        const gameDirectory = path.join(path.dirname(executablePath), 'left4dead2');
        const workshopDirectory = path.join(gameDirectory, 'addons', 'workshop');
        const addonDirectory = path.join(gameDirectory, 'addons');
        const [executableStat, gameStat, addonsStat, workshopStat] = await Promise.all([
            fs.stat(executablePath),
            fs.stat(gameDirectory),
            fs.stat(addonDirectory),
            fs.stat(workshopDirectory)
        ]);
        if (!executableStat.isFile() || !gameStat.isDirectory() || !addonsStat.isDirectory() || !workshopStat.isDirectory()) throw new Error('游戏目录下未找到 left4dead2.exe 或 addons/workshop 文件夹');

        const directories = { executablePath, workshopDirectory, addonDirectory };
        await this.queueSave(async () => {
            const settings = await this.read();
            await this.saveSettings({ ...settings, gameDirectories: directories });
        });
        return directories;
    }

    async flush(): Promise<void> {
        await this.settingsSaveQueue;
    }

    private async read(): Promise<Settings> {
        if (this.settingsCache) return this.settingsCache;

        await fs.mkdir(path.dirname(this.settingsFile), { recursive: true });
        let rawSettings: unknown;
        let settingsFileExists = true;
        try {
            rawSettings = JSON.parse(await fs.readFile(this.settingsFile, 'utf8'));
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
            settingsFileExists = false;
            try {
                rawSettings = this.legacySettingsFile ? JSON.parse(await fs.readFile(this.legacySettingsFile, 'utf8')) : DEFAULT_SETTINGS;
            } catch (legacyError) {
                if ((legacyError as NodeJS.ErrnoException).code !== 'ENOENT') throw legacyError;
                rawSettings = DEFAULT_SETTINGS;
            }
        }
        const settings = normalizeSettings(rawSettings);
        if (!settingsFileExists || JSON.stringify(rawSettings) !== JSON.stringify(settings)) await fs.writeFile(this.settingsFile, serializeSettings(settings), 'utf8');

        this.settingsCache = settings;
        this.settingsSnapshot = structuredClone(settings);
        return this.settingsCache;
    }

    private async saveSettings(settings: Settings): Promise<Settings> {
        const previousSettings = structuredClone(await this.read());
        const normalizedSettings = normalizeSettings(settings);
        this.settingsCache = normalizedSettings;
        try {
            await fs.writeFile(this.settingsFile, serializeSettings(normalizedSettings), 'utf8');
        } catch (error) {
            this.settingsCache = previousSettings;
            throw error;
        }

        const savedSettings = structuredClone(normalizedSettings);
        this.settingsSnapshot = savedSettings;
        this.emit('changed', savedSettings, previousSettings);
        return structuredClone(savedSettings);
    }

    private async queueSave<T>(save: () => Promise<T>): Promise<T> {
        const queuedSave = this.settingsSaveQueue.then(save);
        this.settingsSaveQueue = queuedSave.then(
            () => undefined,
            () => undefined
        );
        return queuedSave;
    }
}
