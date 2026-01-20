import { app, BrowserWindow, ipcMain, Menu } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
const { WebSocketServer } = require("ws");
const { JsonDB, Config } = require("node-json-db");

// Do all the electron stuff
let mainWindow: any
if (started) { app.quit(); }

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1000, height: 700,
    webPreferences: { preload: path.join(__dirname, "preload.js") },
  });
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
  Menu.setApplicationMenu(null)
};
app.on("ready", createWindow);
app.on("window-all-closed", () => { app.quit(); });
app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) { createWindow(); } });

// Initialize your DB and WS
const turtleDB = new JsonDB(new Config("turtleDB", true, true, "/"));
const wss = new WebSocketServer({ port: 8080 });
const turtles = new Map();

async function saveTurtle(id: number, x: number, y: number, z: number, direction: number) {
  const path = `/turtles/${id}`;
  await turtleDB.push(path, { x, y, z, d: direction }, true);
}
async function saveBlock(x: number, y: number, z: number, name: string, color: number) {
  const path = `/world/${x},${y},${z}`;
  await turtleDB.push(path, { name, color }, true);
}

ipcMain.on("send-command", (event, { id, type, content }) => {
  const targetWs = turtles.get(id);
  if(targetWs) targetWs.send(JSON.stringify({ type: type, content: content }));
  else console.error(`[ERROR] Turtle ${id} not found`);
});

wss.on("connection", (ws: any) => {
  let turtleId: number = null;
  ws.on("message", async (msg: string) => {
    const data = JSON.parse(msg.toString());
    
    if(data.type === "handshake") {
      turtleId = data.id;
      turtles.set(turtleId, ws);
      console.log(`[Connected] Turtle ${turtleId}`);
      await saveTurtle(turtleId, 0, 0, 0, 0)
    }

    if(data.type === "response") {
      if(data.response == "ready") mainWindow.webContents.send("ui-locked", false);
      else console.log(`[Turtle ${turtleId}]:`, data);  
    }

    if(data.type === "move") {
      const tPos = await turtleDB.getData(`/turtles/${turtleId}`);
      if(data.response == "up")        saveTurtle(turtleId,tPos.x, tPos.y+1, tPos.z, tPos.d);
      if(data.response == "down")      saveTurtle(turtleId,tPos.x, tPos.y-1, tPos.z, tPos.d);
      if(tPos.d == 0) {
        if(data.response == "forward") saveTurtle(turtleId,tPos.x, tPos.y, tPos.z+1, tPos.d);
        if(data.response == "back")    saveTurtle(turtleId,tPos.x, tPos.y, tPos.z-1, tPos.d);
      }
      if(tPos.d == 1) {
        if(data.response == "forward") saveTurtle(turtleId,tPos.x+1, tPos.y, tPos.z, tPos.d);
        if(data.response == "back")    saveTurtle(turtleId,tPos.x-1, tPos.y, tPos.z, tPos.d);
      }
      if(tPos.d == 2) {
        if(data.response == "forward") saveTurtle(turtleId,tPos.x, tPos.y, tPos.z-1, tPos.d);
        if(data.response == "back")    saveTurtle(turtleId,tPos.x, tPos.y, tPos.z+1, tPos.d);
      }
      if(tPos.d == 3) {
        if(data.response == "forward") saveTurtle(turtleId,tPos.x-1, tPos.y, tPos.z, tPos.d);
        if(data.response == "back")    saveTurtle(turtleId,tPos.x+1, tPos.y, tPos.z, tPos.d);
      }
    }

    if(data.type === "turn") {
      const tPos = await turtleDB.getData(`/turtles/${turtleId}`);
      let newDirection;
      if(data.response == "left") {
        newDirection = tPos.d-1;
        if(newDirection == -1) newDirection = 3;
      }
      if(data.response == "right") { 
        newDirection = tPos.d+1;
        if(newDirection == 4) newDirection = 0;
      }
      saveTurtle(turtleId,tPos.x, tPos.y, tPos.z, newDirection);
    }

    if(data.type === "world") {
      //console.log(`[Turtle ${turtleId}]:`, data);
      const tPos = await turtleDB.getData(`/turtles/${turtleId}`);
      if(data.response.blockU) await saveBlock(tPos.x, tPos.y+1, tPos.z, data.response.blockU.name, data.response.blockU.color);
      if(data.response.blockD) await saveBlock(tPos.x, tPos.y-1, tPos.z, data.response.blockD.name, data.response.blockD.color);
      if(tPos.d == 0) {
        if(data.response.blockF) await saveBlock(tPos.x, tPos.y, tPos.z+1, data.response.blockF.name, data.response.blockF.color);
        if(data.response.blockB) await saveBlock(tPos.x, tPos.y, tPos.z-1, data.response.blockB.name, data.response.blockB.color);
        if(data.response.blockL) await saveBlock(tPos.x-1, tPos.y, tPos.z, data.response.blockL.name, data.response.blockL.color);
        if(data.response.blockR) await saveBlock(tPos.x+1, tPos.y, tPos.z, data.response.blockR.name, data.response.blockR.color);
      }
      if(tPos.d == 1) {
        if(data.response.blockF) await saveBlock(tPos.x+1, tPos.y, tPos.z, data.response.blockF.name, data.response.blockF.color);
        if(data.response.blockB) await saveBlock(tPos.x-1, tPos.y, tPos.z, data.response.blockB.name, data.response.blockB.color);
        if(data.response.blockL) await saveBlock(tPos.x, tPos.y, tPos.z-1, data.response.blockL.name, data.response.blockL.color);
        if(data.response.blockR) await saveBlock(tPos.x, tPos.y, tPos.z+1, data.response.blockR.name, data.response.blockR.color);
      }
      if(tPos.d == 2) {
        if(data.response.blockF) await saveBlock(tPos.x, tPos.y, tPos.z-1, data.response.blockF.name, data.response.blockF.color);
        if(data.response.blockB) await saveBlock(tPos.x, tPos.y, tPos.z+1, data.response.blockB.name, data.response.blockB.color);
        if(data.response.blockL) await saveBlock(tPos.x+1, tPos.y, tPos.z, data.response.blockL.name, data.response.blockL.color);
        if(data.response.blockR) await saveBlock(tPos.x-1, tPos.y, tPos.z, data.response.blockR.name, data.response.blockR.color);
      }
      if(tPos.d == 3) {
        if(data.response.blockF) await saveBlock(tPos.x-1, tPos.y, tPos.z, data.response.blockF.name, data.response.blockF.color);
        if(data.response.blockB) await saveBlock(tPos.x+1, tPos.y, tPos.z, data.response.blockB.name, data.response.blockB.color);
        if(data.response.blockL) await saveBlock(tPos.x, tPos.y, tPos.z+1, data.response.blockL.name, data.response.blockL.color);
        if(data.response.blockR) await saveBlock(tPos.x, tPos.y, tPos.z-1, data.response.blockR.name, data.response.blockR.color);
      }
      mainWindow.webContents.send("world-data", data);
    }
  });
  ws.on("close", () => console.log(`[Disconnected] Turtle ${turtleId}`));
});