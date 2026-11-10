export type WorkshopState = 'synced' | 'disabled' | 'installed';

export interface WorkshopItem {
    id: string;
    hasPreview: boolean;
    source: 'synced' | 'installed';
}

export type WorkshopPreviewState = WorkshopState | 'disabled-synced' | 'disabled-installed';

export interface GameDirectories {
    executablePath: string;
    workshopDirectory: string;
    addonDirectory: string;
}

export interface WorkshopPlatform {
    localize: (id: string) => Promise<void>;
    subscribe: (id: string) => Promise<void>;
}
