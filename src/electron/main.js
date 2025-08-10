import {app, BrowserWindow} from 'electron';
import path from 'path';

app.on("ready", () => {
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        autoHideMenuBar: true,
    });

    mainWindow.loadFile(path.join(app.getAppPath(), "/dist/index.html"));
})