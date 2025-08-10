const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    readAppDataFile: async (folderName, fileName) => {
        return await ipcRenderer.invoke('read-appdata-file', folderName, fileName);
    },
    getPathToJSONFile: async (folderName, fileName) => {
        return await ipcRenderer.invoke('get-path-to-json-file', folderName, fileName);
    },
    sendSumAmountToMain: async(amount) => {
        console.log('Sending sumAmount to the main: ' + amount);
        ipcRenderer.send('send-sum-amount-to-main', amount);
    },
    getSumAmount: () => ipcRenderer.invoke('get-sum-amount'),
});
