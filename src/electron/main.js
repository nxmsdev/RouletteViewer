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

async function getJSONFile() { // gets JSON file with payment data
    try {
        const filePath = path.join(app.getPath('appData'), 'RoulettePaymentTracker', 'paymentData.json'); // build full file path
        return fileSystem.promises.readFile(filePath, 'utf-8'); // read and return file content
    } catch (error) {
        console.log("Couldn't get access to the JSON file.");
        return "";
    }
}

function getTotalAmount(data) { // collect sum of all payment amounts
    return data.reduce((acc, player) => acc + player.amount, 0); // return amount
}

function updateData(oldData, newData, key, equalityFunction, sortFunction) {
    const currentMap = new Map(oldData.map(item => [item[key], item])); // create a map for quick lookup of existing players by username

    let updatedData = [];

    // iterate over new player data
    newData.forEach(newItem => {
        const currentItem = currentMap.get(newItem[key]); // check if player exists in current data

        if (!currentItem) {  // new item
            updatedData.push(newItem);
        } else if (!equalityFunction(currentItem, newItem)) { // existing but changed
            updatedData.push(newItem);
        } else { // old item
            updatedData.push(currentItem);
        }
    });

    if (sortFunction) { // sorting updated data
        updatedData.sort(sortFunction);
    }

    const changed = updatedData.length !== oldData.length || updatedData.some((p, i) => p !== oldData[i]); // check if data changed by length or any player reference mismatch

    return changed ? updatedData : oldData;
}

let playerData = [];
let playerCount = 0;
async function fetchPlayerData() {
    try {
        const jsonData = await getJSONFile(); // read the JSON file contents as a string
        const jsonDataArray = JSON.parse(jsonData); // parse the JSON string into an object/array

        // check if parsed data is an array
        if (Array.isArray(jsonDataArray)) {
            if (jsonDataArray.length === 0) { //
                playerData = [];
            }
            else {
                const equalityFunction = (oldData, newData) => newData.amount === oldData.amount;
                const sortFunction = (a, b) => b.amount - a.amount; // largest first
                playerData = updateData(playerData, jsonDataArray, "username", equalityFunction, sortFunction);
            }

            playerCount = playerData.length;
        }
        else {
            console.error('JSON is not an array');
        }
    }
    catch (error) {
        console.error("Error fetching or parsing data:", error);
        playerData = []
    }
}

// IPC handler to receive sumAmount updates from renderer
ipcMain.handle('get-player-data', async () => {
    await fetchPlayerData();
    return playerData;
});

// IPC handler to receive sumAmount updates from renderer
ipcMain.handle('get-sum-amount', async () => {
    return getTotalAmount(playerData);
});

ipcMain.handle('get-player-count', async () => {
    return playerCount;
})