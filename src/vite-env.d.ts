/// <reference types="vite/client" />

export {};

declare global {
    interface Window {
        electronAPI: {
            getPlayerData: () => Promise<{ username: string, amount: number }[]>;
            getSumAmount: () => Promise<number>;
            getPlayerCount: () => Promise<number>;
            drawTheWinner: () =>  Promise<string>;
            getRouletteStatus: () => Promise<boolean>;
            getWinAmount: () => Promise<number>;
            getTaxAmount: () => Promise<number>;
        };
    }
}