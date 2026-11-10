import type { API } from './api';

declare global {
    interface Window {
        api: API;
    }
}
