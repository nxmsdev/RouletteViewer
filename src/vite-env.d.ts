/// <reference types="vite/client" />

export {};

declare global {
    interface Window {
        electronAPI: {
            readAppDataFile: (folderName: string, fileName: string) => Promise<string>;
            getPathToJSONFile: (folderName: string, fileName: string) => Promise<string>;
            sendSumAmountToMain: (amount: number) => void;
            getSumAmount: () => Promise<number>;
        };
    }
}