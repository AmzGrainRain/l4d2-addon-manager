import { createWriteStream, promises as fs } from 'node:fs';
import { ZipArchive } from '@archiver/archiver';
import { pipeline } from 'node:stream/promises';
import path from 'node:path';
import type { WorkshopItem, WorkshopPreviewState, WorkshopState } from '../shared/workshop';
import type { SettingsManager } from './setting';
const validId = /^\d+$/;

const directoryFor = async (state: WorkshopPreviewState, settingsManager: SettingsManager, create = false) => {
    const configuredDirectories = settingsManager.current().gameDirectories;
    const source = state.startsWith('disabled-') ? state.slice('disabled-'.length) as 'synced' | 'installed' : state;
    const configuredDirectory = source === 'synced' ? configuredDirectories.workshopDirectory : configuredDirectories.addonDirectory;
    if (!configuredDirectory) throw new Error('请先在设置中选择 Left 4 Dead 2 游戏目录');
    const parent = await fs.realpath(configuredDirectory);
    if (state === source) return parent;
    const disabled = path.join(parent, '.disabled');
    if (create) await fs.mkdir(disabled, { recursive: true });
    const stat = await fs.lstat(disabled);
    if (!stat.isDirectory() || stat.isSymbolicLink() || path.dirname(await fs.realpath(disabled)).toLowerCase() !== parent.toLowerCase()) throw new Error('Invalid disabled directory');
    return disabled;
};

const fileFor = async (directory: string, id: string, extension: 'vpk' | 'jpg') => {
    if (!validId.test(id)) throw new Error('Invalid workshop item ID');
    const file = path.join(directory, `${id}.${extension}`);
    try {
        const stat = await fs.lstat(file);
        if (!stat.isFile() || stat.isSymbolicLink() || path.dirname(await fs.realpath(file)).toLowerCase() !== directory.toLowerCase()) throw new Error('Invalid workshop file');
        return file;
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
        throw error;
    }
};

export const listWorkshopItems = async (state: WorkshopState, settingsManager: SettingsManager): Promise<WorkshopItem[]> => {
    if (state === 'disabled') {
        const [synced, installed] = await Promise.all([
            listWorkshopItemsFromDirectory('disabled-synced', 'synced', settingsManager),
            listWorkshopItemsFromDirectory('disabled-installed', 'installed', settingsManager)
        ]);
        return [...synced, ...installed].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
    }
    return listWorkshopItemsFromDirectory(state, state, settingsManager);
};

const listWorkshopItemsFromDirectory = async (location: WorkshopPreviewState, source: WorkshopItem['source'], settingsManager: SettingsManager): Promise<WorkshopItem[]> => {
    let directory: string;
    try {
        directory = await directoryFor(location, settingsManager);
    } catch (error) {
        if (location.startsWith('disabled-') && (error as NodeJS.ErrnoException).code === 'ENOENT') return [];
        throw error;
    }
    const entries = await fs.readdir(directory, { withFileTypes: true });
    const names = new Set(entries.filter((entry) => entry.isFile()).map((entry) => entry.name));
    return entries
        .filter((entry) => entry.isFile() && /^\d+\.vpk$/.test(entry.name))
        .map((entry) => {
            const id = entry.name.slice(0, -4);
            return { id, hasPreview: names.has(`${id}.jpg`), source };
        })
        .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
};

export const moveWorkshopItem = async (id: string, source: WorkshopItem['source'], settingsManager: SettingsManager, restore = false) => {
    if (!validId.test(id)) throw new Error('Invalid workshop item ID');
    const from = await directoryFor(restore ? `disabled-${source}` : source, settingsManager);
    const to = await directoryFor(restore ? source : `disabled-${source}`, settingsManager, true);
    const files = await Promise.all([fileFor(from, id, 'vpk'), fileFor(from, id, 'jpg')]);
    if (!files[0]) throw new Error('Workshop item not found');
    for (const extension of ['vpk', 'jpg'] as const) {
        try {
            await fs.lstat(path.join(to, `${id}.${extension}`));
            throw new Error('Destination already exists');
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
        }
    }
    const linked: { source: string; destination: string; removed: boolean }[] = [];
    try {
        for (const file of files) {
            if (!file) continue;
            const target = path.join(to, path.basename(file));
            await fs.link(file, target);
            linked.push({ source: file, destination: target, removed: false });
        }
        for (const file of linked) {
            await fs.unlink(file.source);
            file.removed = true;
        }
    } catch (error) {
        for (const file of linked.reverse()) {
            if (file.removed) await fs.link(file.destination, file.source);
            await fs.unlink(file.destination);
        }
        throw error;
    }
};

export const localizeWorkshopItem = async (id: string, settingsManager: SettingsManager, unsubscribe: () => Promise<boolean>) => {
    if (!validId.test(id)) throw new Error('Invalid workshop item ID');
    const configuredDirectories = settingsManager.current().gameDirectories;
    if (!configuredDirectories.workshopDirectory || !configuredDirectories.addonDirectory) throw new Error('请先在设置中选择 Left 4 Dead 2 游戏目录');
    const workshopDirectory = await fs.realpath(configuredDirectories.workshopDirectory);
    const addonDirectory = await fs.realpath(configuredDirectories.addonDirectory);
    const files = await Promise.all([fileFor(workshopDirectory, id, 'vpk'), fileFor(workshopDirectory, id, 'jpg')]);
    if (!files[0]) throw new Error('Workshop item not found');

    for (const extension of ['vpk', 'jpg'] as const) {
        try {
            await fs.lstat(path.join(addonDirectory, `${id}.${extension}`));
            throw new Error('Destination already exists');
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
        }
    }

    const movedFiles: { source: string; destination: string; sourceRemoved: boolean }[] = [];
    try {
        for (const file of files) {
            if (!file) continue;
            const destination = path.join(addonDirectory, path.basename(file));
            await fs.link(file, destination);
            movedFiles.push({ source: file, destination, sourceRemoved: false });
        }
        for (const file of movedFiles) {
            await fs.unlink(file.source);
            file.sourceRemoved = true;
        }
        if (!await unsubscribe()) throw new Error('Steam failed to unsubscribe from this Workshop item');
    } catch (error) {
        const rollbackErrors: unknown[] = [];
        for (const file of movedFiles.reverse()) {
            try {
                if (file.sourceRemoved) {
                    try {
                        await fs.link(file.destination, file.source);
                    } catch (rollbackError) {
                        if ((rollbackError as NodeJS.ErrnoException).code !== 'EEXIST') throw rollbackError;
                    }
                }
                await fs.unlink(file.destination);
            } catch (rollbackError) {
                rollbackErrors.push(rollbackError);
            }
        }
        if (rollbackErrors.length) throw new AggregateError([error, ...rollbackErrors], 'Workshop item localization failed and rollback was incomplete');
        throw error;
    }
};

export const convertLocalItemToWorkshop = async (id: string, settingsManager: SettingsManager, subscribe: () => Promise<boolean>, unsubscribe: () => Promise<boolean>) => {
    if (!validId.test(id)) throw new Error('Invalid workshop item ID');
    const configuredDirectories = settingsManager.current().gameDirectories;
    if (!configuredDirectories.addonDirectory || !configuredDirectories.workshopDirectory) throw new Error('请先在设置中选择 Left 4 Dead 2 游戏目录');
    const addonDirectory = await fs.realpath(configuredDirectories.addonDirectory);
    const workshopDirectory = await fs.realpath(configuredDirectories.workshopDirectory);
    const files = await Promise.all([fileFor(addonDirectory, id, 'vpk'), fileFor(addonDirectory, id, 'jpg')]);
    if (!files[0]) throw new Error('Local add-on not found');

    for (const extension of ['vpk', 'jpg'] as const) {
        try {
            await fs.lstat(path.join(workshopDirectory, `${id}.${extension}`));
            throw new Error('Workshop destination already exists');
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
        }
    }
    if (!await subscribe()) throw new Error('Steam failed to subscribe to this Workshop item');

    const moved: { source: string; destination: string }[] = [];
    try {
        for (const file of files) {
            if (!file) continue;
            const destination = path.join(workshopDirectory, path.basename(file));
            await fs.link(file, destination);
            moved.push({ source: file, destination });
        }
        for (const file of moved) await fs.unlink(file.source);
    } catch (error) {
        const rollbackErrors: unknown[] = [];
        for (const file of moved.reverse()) {
            try {
                try {
                    await fs.link(file.destination, file.source);
                } catch (rollbackError) {
                    if ((rollbackError as NodeJS.ErrnoException).code !== 'EEXIST') throw rollbackError;
                }
                await fs.unlink(file.destination);
            } catch (rollbackError) {
                rollbackErrors.push(rollbackError);
            }
        }
        try {
            if (!await unsubscribe()) throw new Error('Steam failed to unsubscribe during rollback');
        } catch (rollbackError) {
            rollbackErrors.push(rollbackError);
        }
        if (rollbackErrors.length) throw new AggregateError([error, ...rollbackErrors], 'Workshop conversion failed and rollback was incomplete');
        throw error;
    }
};

export const deleteWorkshopItem = async (id: string, source: WorkshopItem['source'], settingsManager: SettingsManager) => {
    const directory = await directoryFor(`disabled-${source}`, settingsManager);
    const files = await Promise.all([fileFor(directory, id, 'vpk'), fileFor(directory, id, 'jpg')]);
    if (!files[0]) throw new Error('Workshop item not found');
    if (files[1]) await fs.unlink(files[1]);
    await fs.unlink(files[0]);
};

export const readWorkshopPreview = async (id: string, state: WorkshopPreviewState, settingsManager: SettingsManager) => {
    const directory = await directoryFor(state, settingsManager);
    const file = await fileFor(directory, id, 'jpg');
    if (!file) throw new Error('Preview not found');
    return fs.readFile(file);
};

export const exportWorkshopItems = async (state: WorkshopState, items: Pick<WorkshopItem, 'id' | 'source'>[], outputPath: string, settingsManager: SettingsManager) => {
    if (!path.isAbsolute(outputPath) || path.extname(outputPath).toLowerCase() !== '.zip') throw new Error('Invalid ZIP export path');
    const archive = new ZipArchive({ store: true });
    const output = createWriteStream(outputPath);
    const outputComplete = pipeline(archive, output);
    try {
        for (const item of items) {
            if (!validId.test(item.id)) throw new Error('Invalid workshop item ID');
            if (state !== 'disabled' && item.source !== state) throw new Error('Workshop item source does not match the selected page');
            const location = state === 'disabled' ? `disabled-${item.source}` as WorkshopPreviewState : state;
            const directory = await directoryFor(location, settingsManager);
            const files = await Promise.all([fileFor(directory, item.id, 'vpk'), fileFor(directory, item.id, 'jpg')]);
            if (!files[0]) throw new Error(`Workshop item ${item.id} not found`);
            const prefix = state === 'disabled' ? `${item.source}/` : '';
            for (const file of files) {
                if (file) archive.file(file, { name: `${prefix}${path.basename(file)}` });
            }
        }
        await archive.finalize();
        await outputComplete;
    } catch (error) {
        archive.abort();
        output.destroy();
        await outputComplete.catch(() => undefined);
        await fs.rm(outputPath, { force: true });
        throw error;
    }
};
