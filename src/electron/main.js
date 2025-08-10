import {app, BrowserWindow, ipcMain} from 'electron';
import * as path from 'path';
import * as fileSystem from "node:fs";

// returns the absolute path to the preload script
function getPreloadPath() {
    return path.join(app.getAppPath(), 'src', 'electron', 'preload.js');
}

let mainWindow = null;

// creates the main application window and loads the frontend HTML
async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        autoHideMenuBar: true, // hide the menu bar unless Alt is pressed
        webPreferences: {
            preload: getPreloadPath(), // preloads preload.js file
            contextIsolation: true, // isolates renderer context for security
        }
    });

    // load the main HTML file into the window
    try {
        await mainWindow.loadFile(path.join(app.getAppPath(), 'dist', 'index.html'));
        console.log('Page loaded successfully');
    }
    catch (error) {
        console.log('Failed to load page: ' + error);
    }
}

// when Electron has finished initialization, create the window
app.whenReady().then(createWindow);

// IPC handler to read a file from the appData folder and return its content as a string
ipcMain.handle('read-appdata-file', async (event, folderName, fileName) => {
    try {
        const appDataPath = app.getPath('appData'); // get OS-specific app data directory
        const filePath = path.join(appDataPath, folderName, fileName); // build full file path
        return await fileSystem.promises.readFile(filePath, 'utf-8'); // read and return file content
    } catch (error) {
        return { error: error.message };
    }
});

// IPC handler to get the full path of a JSON file inside appData folder
ipcMain.handle('get-path-to-json-file', async (event, folderName, fileName) => {
    try {
        const appDataPath = app.getPath('appData');
        return path.join(appDataPath, folderName, fileName);
    } catch (error) {
        return { error: error.message };
    }
})

let currentSumAmount = 0; // variable to store the current sum amount received from the renderer
// IPC handler to receive sumAmount updates from renderer
ipcMain.handle('get-sum-amount', async () => {
    return currentSumAmount;
});

// IPC handler to receive sumAmount and log it (alternative way to receive data)
ipcMain.on('send-sum-amount-to-main', (event, amount) => {
    currentSumAmount = amount;
});
