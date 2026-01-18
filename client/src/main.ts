import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
const { WebSocketServer } = require("ws");
const { JsonDB, Config } = require("node-json-db");

// Initialize your DB and WS
const turtleDB = new JsonDB(new Config("turtle", true, true, "/db"));
const wss = new WebSocketServer({ port: 8080 });
const turtles = new Map();

wss.on("connection", (ws: any) => {
  let turtleId: number = null;
  ws.on("message", (msg: string) => {
    const data = JSON.parse(msg.toString());
    
    if(data.type === "handshake") {
      turtleId = data.id;
      turtles.set(turtleId, ws);
      console.log(`[Connected] Turtle ${turtleId}`);
    }

    if(data.type === "response") {
      console.log(`[Turtle ${turtleId}]:`, data);  
      // OPTIONAL: Send this data to your Three.js window!
      // mainWindow.webContents.send('turtle-data', data);
    }
  });
  ws.on("close", () => console.log(`[Disconnected] Turtle ${turtleId}`));
});

ipcMain.on('send-to-turtle', (event, { id, type, content }) => {
  const targetWs = turtles.get(id);
  if (targetWs) {
    targetWs.send(JSON.stringify({ type: type, content: content }));
    console.log(`[Sent to T${id}] via UI: ${content}`);
  } else {
    console.error(`[ERROR] Turtle ${id} not found`);
  }
});

// Da all the electron stuff
if (started) { app.quit(); }

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
  });
  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }
  //mainWindow.webContents.openDevTools();
};

app.on('ready', createWindow);

app.on('window-all-closed', () => { app.quit(); });

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
