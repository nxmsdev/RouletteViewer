const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getPlayerData: () => ipcRenderer.invoke('get-player-data'),
    getSumAmount: () => ipcRenderer.invoke('get-sum-amount'),
    getPlayerCount: () => ipcRenderer.invoke('get-player-count'),
});
