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

let playerData = [];
async function fetchPlayerData() {
    try {
        const jsonData = await getJSONFile(); // read the JSON file contents as a string
        const jsonDataArray = JSON.parse(jsonData); // parse the JSON string into an object/array

        // check if parsed data is an array
        if (Array.isArray(jsonDataArray)) {
            if (jsonDataArray.length === 0) {
                playerData = [];
            }
            else {
                const currentMap = new Map(playerData.map(player => [player.username, player])); // create a map for quick lookup of existing players by username

                let updatedData = [];
                const handledUsernames = new Set(); // keep track of usernames already handled

                // iterate over new player data
                jsonDataArray.forEach(newPlayer => {
                    const currentPlayer = currentMap.get(newPlayer.username); // check if player exists in current data

                    if (!currentPlayer) {  // add updated player if player is new or amount changed
                        updatedData.push(newPlayer);
                    } else if (currentPlayer.amount !== newPlayer.amount) {
                        updatedData.push(newPlayer);
                    } else { // otherwise, keep existing player object to preserve references
                        updatedData.push(currentPlayer);
                    }

                    handledUsernames.add(newPlayer.username);
                });

                const changed = updatedData.length !== playerData.length || updatedData.some((p, i) => p !== playerData[i]); // check if data changed by length or any player reference mismatch

                if (changed) {
                    playerData = updatedData; // update playerData
                }
            }
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