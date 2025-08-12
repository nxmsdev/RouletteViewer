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
    await clearJSONDataFile(winnerDataFilePath, "");
})

// paths to JSON files at AppData folder
let paymentDataFilePath = path.join(app.getPath('appData'), 'RoulettePaymentTracker', 'paymentData.json');
let winnerDataFilePath = path.join(app.getPath('appData'), 'RoulettePaymentTracker', 'winnerData.json')
let rouletteStatusFilePath = path.join(app.getPath('appData'), 'RoulettePaymentTracker', 'rouletteStatus.json')

async function getJSONFile(filePath) { // gets JSON file with payment data
    try {
        return fileSystem.promises.readFile(filePath, 'utf-8'); // read and return file content
    } catch (error) {
        console.log("Couldn't get access to the JSON file.");
        return "";
    }
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

// async function to clear JSON file content after winner is drawn
async function clearJSONDataFile(filePath, initialText) {
    try {
        await fileSystem.promises.writeFile(filePath, initialText, 'utf-8');
        console.log("Cleared data file:", filePath);
    } catch (error) {
        console.error("Failed to clear data file:", error);
    }
}

let playerData = [];
let playerCount = 0;
async function fetchPlayerData() {
    try {
        const jsonData = await getJSONFile(paymentDataFilePath); // read the JSON file contents as a string
        const playerDataArray = JSON.parse(jsonData); // parse the JSON string into an object/array

        // check if parsed data is an array
        if (Array.isArray(playerDataArray)) {
            if (playerDataArray.length === 0) { //
                playerData = [];
            }
            else {
                const equalityFunction = (oldData, newData) => newData.amount === oldData.amount;
                const sortFunction = (a, b) => b.amount - a.amount; // largest first
                playerData = updateData(playerData, playerDataArray, "username", equalityFunction, sortFunction);
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

ipcMain.handle('get-player-data', async () => {
    await fetchPlayerData();
    return playerData;
});

ipcMain.handle('get-player-count', async () => {
    return playerCount;
})

function getSumAmount(data) { // collect sum of all payment amounts
    return data.reduce((acc, player) => acc + player.amount, 0); // return amount
}
ipcMain.handle('get-sum-amount', async () => {
    return getSumAmount(playerData);
});

// draw a winner
function getWinnerFromDraw() {
    const random = Math.random() * getSumAmount(playerData);

    let cumulative = 0;
    for (const player of playerData) {
        cumulative += player.amount;
        if (random < cumulative) {
            console.log("Winner: " + player.username);
            return player.username;
        }
    }
}

// async function to save winner info to a JSON file
async function saveWinnerToFile(winner, winAmount, filePath) {
    try {
        const winnerUsername = { username: winner, amount: winAmount};
        await fileSystem.promises.writeFile(filePath, JSON.stringify(winnerUsername, winAmount), 'utf-8');
        console.log("Saved winner to file:", filePath);
    } catch (error) {
        console.error("Failed to save winner file:", error);
    }
}

let winAmountPrecentage = 0.92;
ipcMain.handle('draw-the-winner', async () => {
    const winner = getWinnerFromDraw();
    const winAmount = parseFloat(Number(getSumAmount(playerData) * winAmountPrecentage).toFixed(0));

    if (winner) {
        // save winner's username to the JSON file
        await saveWinnerToFile(winner, winAmount, winnerDataFilePath);

        // clear the JSON file with payment data
        await clearJSONDataFile(paymentDataFilePath, "[]");

        // clear variables connected with JSON file reading
        playerData = [];
        playerCount = 0;
    }

    return winner;
})

let rouletteStatus = false;
async function fetchRouletteStatus() {
    try {
        const jsonData = await getJSONFile(rouletteStatusFilePath); // await the promise
        const rouletteData = JSON.parse(jsonData); // now this is safe
        rouletteStatus = rouletteData.rouletteStatus;
    }
    catch (error) {
        console.error("Error fetching or parsing data:", error);
        rouletteStatus = false;
    }
}

ipcMain.handle('get-roulette-status', async () => {
    await fetchRouletteStatus();
    return rouletteStatus;
});