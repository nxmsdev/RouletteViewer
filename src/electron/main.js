import {app, BrowserWindow, ipcMain} from 'electron';
import * as path from 'path';
import * as fileSystem from "node:fs";

// returns the absolute path to the preload script
function getPreloadPath() {
    return path.join(app.getAppPath(), 'src', 'electron', 'preload.js');
}

let mainWindow = null;
let windowSizeMultiplier = 1;

// creates the main application window and loads the frontend HTML
async function createWindow() {

    mainWindow = new BrowserWindow({
        width: 1280 * windowSizeMultiplier,
        height: 720 * windowSizeMultiplier,
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
app.on('ready', async () => {
    await createWindow();
})

app.on('before-quit', async () => {
    await clearJSONDataFile(path.join(app.getPath('appData'), 'RoulettePaymentTracker', 'winnerData.json'));
})


let paymentDataFilePath = path.join(app.getPath('appData'), 'RoulettePaymentTracker', 'paymentData.json');
let winnerDataFilePath = path.join(app.getPath('appData'), 'RoulettePaymentTracker', 'paymentData.json')

async function getJSONFile() { // gets JSON file with payment data
    try {
        return fileSystem.promises.readFile(paymentDataFilePath, 'utf-8'); // read and return file content
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

function getWinnerFromDraw() {
    const random = Math.random() * getTotalAmount(playerData);

    let cumulative = 0;
    for (const player of playerData) {
        cumulative += player.amount;
        if (random < cumulative) {
            console.log("Winner: " + player.username);
            return player.username;
        }
    }
}

// async function to clear JSON file content after winner is drawn
async function clearJSONDataFile(filePath) {
    try {
        await fileSystem.promises.writeFile(filePath, JSON.stringify([]), 'utf-8');
        console.log("Cleared data file:", filePath);
    } catch (error) {
        console.error("Failed to clear data file:", error);
    }
}

// async function to save winner info to a JSON file
async function saveWinnerToFile(winner, filePath) {
    try {
        const winnerUsername = { username: winner };
        await fileSystem.promises.writeFile(filePath, JSON.stringify(winnerUsername), 'utf-8');
        console.log("Saved winner to file:", filePath);
    } catch (error) {
        console.error("Failed to save winner file:", error);
    }
}

ipcMain.handle('get-player-data', async () => {
    await fetchPlayerData();
    return playerData;
});

ipcMain.handle('get-sum-amount', async () => {
    return getTotalAmount(playerData);
});

ipcMain.handle('get-player-count', async () => {
    return playerCount;
})

ipcMain.handle('draw-the-winner', async () => {
    const winner = getWinnerFromDraw();

    if (winner) {
        // save winner's username to the JSON file
        await saveWinnerToFile(winner, winnerDataFilePath);

        // clear the JSON file with payment data
        await clearJSONDataFile(paymentDataFilePath);

        // clear variables connected with JSON file reading
        playerData = [];
        playerCount = 0;
    }

    return winner;
})