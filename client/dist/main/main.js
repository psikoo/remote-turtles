"use strict";
const electron = require("electron");
const path$1 = require("node:path");
const started = require("electron-squirrel-startup");
const THREE = require("three");
const nodeJsonDb = require("node-json-db");
const path = require("path");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const THREE__namespace = /* @__PURE__ */ _interopNamespaceDefault(THREE);
new THREE__namespace.BoxGeometry(1, 1, 1);
const db = new nodeJsonDb.JsonDB(new nodeJsonDb.Config(path.join(__dirname, "../../db/turtleDB"), true, true, "/"));
const DatabaseManager = {
  async saveTurtle(id, x, y, z, direction) {
    await db.push(`/turtles/${id}`, { x, y, z, d: direction }, true);
  },
  async getTurtle(id) {
    try {
      return await db.getData(`/turtles/${id}`);
    } catch {
      return {};
    }
  },
  async saveBlock(x, y, z, name, color) {
    await db.push(`/world/${x},${y},${z}`, { name, color }, true);
  },
  async getBlock(x, y, z, name, color) {
    try {
      return await db.getData(`/world/${x},${y},${z}`);
    } catch {
      return {};
    }
  },
  async getFullWorld() {
    try {
      return await db.getData("/world");
    } catch {
      return {};
    }
  }
};
const { WebSocketServer } = require("ws");
const { JsonDB, Config } = require("node-json-db");
let mainWindow;
if (started) {
  electron.app.quit();
}
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1e3,
    height: 700,
    webPreferences: { preload: path$1.join(__dirname, "preload.js") }
  });
  {
    mainWindow.loadURL("http://localhost:5173");
  }
  electron.Menu.setApplicationMenu(null);
  mainWindow.webContents.openDevTools();
}
electron.app.whenReady().then(() => {
  createWindow();
  mainWindow.webContents.on("did-finish-load", () => {
    sendFullWorld();
  });
});
electron.app.on("window-all-closed", () => {
  electron.app.quit();
});
electron.app.on("activate", () => {
  if (electron.BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
const wss = new WebSocketServer({ port: 8080 });
const turtles = /* @__PURE__ */ new Map();
const messageQueues = /* @__PURE__ */ new Map();
async function sendFullWorld() {
  try {
    mainWindow.webContents.send("initial-world-load", await DatabaseManager.getFullWorld());
  } catch (error) {
    console.log("[ERROR] Database is empty or world key not found");
  }
}
electron.ipcMain.on("send-command", (event, { id, type, content }) => {
  const targetWs = turtles.get(id);
  if (targetWs) targetWs.send(JSON.stringify({ type, content }));
  else {
    console.error(`[ERROR] Turtle ${id} not found`);
    mainWindow.webContents.send("ui-locked", false);
  }
});
wss.on("connection", async (ws) => {
  let turtleId = null;
  ws.on("message", async (msg) => {
    const data = JSON.parse(msg.toString());
    if (data.type === "handshake") {
      turtleId = data.id;
      turtles.set(turtleId, ws);
      messageQueues.set(turtleId, Promise.resolve());
      console.log(`[Connected] Turtle ${turtleId}`);
      if (!await DatabaseManager.getTurtle(turtleId)) {
        await DatabaseManager.saveTurtle(turtleId, 0, 0, 0, 0);
      }
    }
    if (!turtleId) return;
    const currentQueue = messageQueues.get(turtleId) || Promise.resolve();
    const nextInQueue = currentQueue.then(async () => {
      try {
        await handleTurtleMessage(data, turtleId, ws);
      } catch (err) {
        console.error(`[ERROR] Turtle ${turtleId} cant process message:`, err);
      }
    });
    messageQueues.set(turtleId, nextInQueue);
  });
  ws.on("close", () => console.log(`[Disconnected] Turtle ${turtleId}`));
});
async function handleTurtleMessage(data, turtleId, ws) {
  if (data.type === "response") {
    if (data.response == "ready") mainWindow.webContents.send("ui-locked", false);
    else console.log(`[Turtle ${turtleId}]:`, data);
  }
  if (data.type === "move") {
    const tPos = await DatabaseManager.getTurtle(turtleId);
    if (data.response == "up") await DatabaseManager.saveTurtle(turtleId, tPos.x, tPos.y + 1, tPos.z, tPos.d);
    if (data.response == "down") await DatabaseManager.saveTurtle(turtleId, tPos.x, tPos.y - 1, tPos.z, tPos.d);
    if (tPos.d == 0) {
      if (data.response == "forward") await DatabaseManager.saveTurtle(turtleId, tPos.x, tPos.y, tPos.z + 1, tPos.d);
      if (data.response == "back") await DatabaseManager.saveTurtle(turtleId, tPos.x, tPos.y, tPos.z - 1, tPos.d);
    }
    if (tPos.d == 1) {
      if (data.response == "forward") await DatabaseManager.saveTurtle(turtleId, tPos.x - 1, tPos.y, tPos.z, tPos.d);
      if (data.response == "back") await DatabaseManager.saveTurtle(turtleId, tPos.x + 1, tPos.y, tPos.z, tPos.d);
    }
    if (tPos.d == 2) {
      if (data.response == "forward") await DatabaseManager.saveTurtle(turtleId, tPos.x, tPos.y, tPos.z - 1, tPos.d);
      if (data.response == "back") await DatabaseManager.saveTurtle(turtleId, tPos.x, tPos.y, tPos.z + 1, tPos.d);
    }
    if (tPos.d == 3) {
      if (data.response == "forward") await DatabaseManager.saveTurtle(turtleId, tPos.x + 1, tPos.y, tPos.z, tPos.d);
      if (data.response == "back") await DatabaseManager.saveTurtle(turtleId, tPos.x - 1, tPos.y, tPos.z, tPos.d);
    }
    mainWindow.webContents.send("turtle-move", await DatabaseManager.getTurtle(turtleId));
  }
  if (data.type === "turn") {
    const tPos = await DatabaseManager.getTurtle(turtleId);
    let newDirection;
    if (data.response == "left") {
      newDirection = tPos.d - 1;
      if (newDirection == -1) newDirection = 3;
    }
    if (data.response == "right") {
      newDirection = tPos.d + 1;
      if (newDirection == 4) newDirection = 0;
    }
    await DatabaseManager.saveTurtle(turtleId, tPos.x, tPos.y, tPos.z, newDirection);
    mainWindow.webContents.send("turtle-turn", newDirection);
  }
  if (data.type === "world") {
    const tPos = await DatabaseManager.getTurtle(turtleId);
    if (data.response.blockU) await DatabaseManager.saveBlock(tPos.x, tPos.y + 1, tPos.z, data.response.blockU.name, data.response.blockU.color);
    if (data.response.blockD) await DatabaseManager.saveBlock(tPos.x, tPos.y - 1, tPos.z, data.response.blockD.name, data.response.blockD.color);
    if (tPos.d == 0) {
      if (data.response.blockF) await DatabaseManager.saveBlock(tPos.x, tPos.y, tPos.z + 1, data.response.blockF.name, data.response.blockF.color);
      if (data.response.blockB) await DatabaseManager.saveBlock(tPos.x, tPos.y, tPos.z - 1, data.response.blockB.name, data.response.blockB.color);
      if (data.response.blockL) await DatabaseManager.saveBlock(tPos.x + 1, tPos.y, tPos.z, data.response.blockL.name, data.response.blockL.color);
      if (data.response.blockR) await DatabaseManager.saveBlock(tPos.x - 1, tPos.y, tPos.z, data.response.blockR.name, data.response.blockR.color);
    }
    if (tPos.d == 1) {
      if (data.response.blockF) await DatabaseManager.saveBlock(tPos.x - 1, tPos.y, tPos.z, data.response.blockF.name, data.response.blockF.color);
      if (data.response.blockB) await DatabaseManager.saveBlock(tPos.x + 1, tPos.y, tPos.z, data.response.blockB.name, data.response.blockB.color);
      if (data.response.blockL) await DatabaseManager.saveBlock(tPos.x, tPos.y, tPos.z + 1, data.response.blockL.name, data.response.blockL.color);
      if (data.response.blockR) await DatabaseManager.saveBlock(tPos.x, tPos.y, tPos.z - 1, data.response.blockR.name, data.response.blockR.color);
    }
    if (tPos.d == 2) {
      if (data.response.blockF) await DatabaseManager.saveBlock(tPos.x, tPos.y, tPos.z - 1, data.response.blockF.name, data.response.blockF.color);
      if (data.response.blockB) await DatabaseManager.saveBlock(tPos.x, tPos.y, tPos.z + 1, data.response.blockB.name, data.response.blockB.color);
      if (data.response.blockL) await DatabaseManager.saveBlock(tPos.x - 1, tPos.y, tPos.z, data.response.blockL.name, data.response.blockL.color);
      if (data.response.blockR) await DatabaseManager.saveBlock(tPos.x + 1, tPos.y, tPos.z, data.response.blockR.name, data.response.blockR.color);
    }
    if (tPos.d == 3) {
      if (data.response.blockF) await DatabaseManager.saveBlock(tPos.x + 1, tPos.y, tPos.z, data.response.blockF.name, data.response.blockF.color);
      if (data.response.blockB) await DatabaseManager.saveBlock(tPos.x - 1, tPos.y, tPos.z, data.response.blockB.name, data.response.blockB.color);
      if (data.response.blockL) await DatabaseManager.saveBlock(tPos.x, tPos.y, tPos.z - 1, data.response.blockL.name, data.response.blockL.color);
      if (data.response.blockR) await DatabaseManager.saveBlock(tPos.x, tPos.y, tPos.z + 1, data.response.blockR.name, data.response.blockR.color);
    }
    sendFullWorld();
  }
}
