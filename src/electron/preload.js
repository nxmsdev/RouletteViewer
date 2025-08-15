const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getPlayerData: () => ipcRenderer.invoke('get-player-data'),
    getSumAmount: () => ipcRenderer.invoke('get-sum-amount'),
    getPlayerCount: () => ipcRenderer.invoke('get-player-count'),
    drawTheWinner: () => ipcRenderer.invoke('draw-the-winner'),
    getRouletteStatus: () => ipcRenderer.invoke('get-roulette-status'),
    getWinAmount: () => ipcRenderer.invoke('get-win-amount'),
    getTaxAmount: () => ipcRenderer.invoke('get-tax-amount'),
});
