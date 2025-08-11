/// <reference types="vite/client" />

export {};

declare global {
    interface Window {
        electronAPI: {
            getPlayerData: () => Promise<{ username: string, amount: number }[]>;
            getSumAmount: () => Promise<number>;
        };
    }
}