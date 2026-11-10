import { SteamworksSDK } from 'steamworks-ffi-node';
import { app } from 'electron';
import path from 'node:path';

export class Steam {
    private readonly sdk = SteamworksSDK.getInstance();
    private callbackInterval: NodeJS.Timeout | undefined;

    init(appId: number): void {
        if (this.callbackInterval) return;
        this.sdk.setSdkPath(path.join(app.isPackaged ? process.resourcesPath : app.getAppPath(), 'steamworks_sdk'));
        this.sdk.setDebug(false);
        if (!this.sdk.init({ appId })) throw new Error('Steamworks initialization failed');
        this.callbackInterval = setInterval(() => this.sdk.runCallbacks(), 1000);
    }

    reset(): void {
        if (!this.callbackInterval) return;
        clearInterval(this.callbackInterval);
        this.callbackInterval = undefined;
        this.sdk.shutdown();
    }

    getAppInstallDir(appId: number): string {
        if (!this.callbackInterval) throw new Error('Steamworks is not initialized');
        return this.sdk.apps.getAppInstallDir(appId);
    }

    async setSubscribed(id: string, subscribed: boolean): Promise<boolean> {
        if (!this.callbackInterval) throw new Error('Steamworks is not initialized');
        const itemId = BigInt(id);
        return subscribed ? this.sdk.workshop.subscribeItem(itemId) : this.sdk.workshop.unsubscribeItem(itemId);
    }
}
