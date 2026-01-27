import { app, BrowserWindow, Menu } from "electron";
import started from "electron-squirrel-startup";
import path from "node:path";
import { DatabaseManager, TurtleManager } from ".";

let mainWindow: any

export const electronManager = {
  getMainWindow: () => mainWindow,

  init(openDevTools: boolean) {
    if (started) { app.quit(); }

    app.whenReady().then(() => {
      createWindow();
      mainWindow.webContents.on("did-finish-load", async () => { 
        const worldData = await DatabaseManager.getFullWorld();
        if(worldData) mainWindow.webContents.send("initial-world-load", worldData);
        TurtleManager.disconnectAll();
      });
      if(openDevTools) mainWindow.webContents.openDevTools();
    });
    
    app.on("window-all-closed", () => { app.quit(); });
    app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) { createWindow(); } });
  },
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000, height: 700,
    webPreferences: { preload: path.join(__dirname, "preload.js") },
    icon: "./assets/icon/icon.png"
  });
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
  Menu.setApplicationMenu(null);
}