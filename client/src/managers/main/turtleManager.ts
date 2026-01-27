import { ipcMain } from "electron";
import { DatabaseManager, electronManager } from ".";

const turtles = new Map();
const messageQueues = new Map<number, Promise<void>>();

export const TurtleManager = {
  getMessageQueue(turtleId: number) {
    return messageQueues.get(turtleId);
  },
  setMessageQueue(turtleId: number, promise: any ) {
    messageQueues.set(turtleId, promise);
  },

  init() {
    setupCommandListener();
  },

  removeTurtle(turtleId: number) {
    console.log(`[Disconnected] Turtle ${turtleId}`);
    turtles.delete(turtleId);
  },

  disconectAll() {
    turtles.forEach((turtle) => {
      turtle.close(1001, "Renderer reloading");
    });
    turtles.clear();
  },

  async handleHandshake(ws: any, data: any): Promise<number> {
    const turtleId = data.response.id;
    turtles.set(turtleId, ws);
    this.setMessageQueue(turtleId, Promise.resolve());
    console.log(`[Connected] Turtle ${turtleId}`);

    let turtle = await DatabaseManager.getTurtle(turtleId);
    if(!turtle) turtle = await DatabaseManager.saveTurtle(turtleId, 0, 0, 0, 0);

    electronManager.getMainWindow().webContents.send("turtle-id", turtleId);
    electronManager.getMainWindow().webContents.send("turtle-move", { x: turtle.x, y: turtle.y, z: turtle.z });
    electronManager.getMainWindow().webContents.send("turtle-turn", turtle.d);
    electronManager.getMainWindow().webContents.send("turtle-fuel", data.response.fuel);
    electronManager.getMainWindow().webContents.send("turtle-slot", data.response.slot);
    electronManager.getMainWindow().webContents.send("turtle-inventory", data.response.inventory);
    return turtleId;
  },

  async handleTurtleMessageResponse(turtleId: number, data: any) {
    if(data.response == "ready") electronManager.getMainWindow().webContents.send("ui-locked", false);
    else console.log(`[Turtle ${turtleId}]:`, data); 
  },

  async handleTurtleMessageFuel(turtleId: number, data: any) {
    electronManager.getMainWindow().webContents.send("turtle-fuel", data.response);
  },

  async handleTurtleMessageSlot(turtleId: number, data: any) {
    electronManager.getMainWindow().webContents.send("turtle-slot", data.response);
  },

  async handleTurtleMessageMove(turtleId: number, data: any) {
    const tPos = await DatabaseManager.getTurtle(turtleId);
    if(data.response == "up")        await DatabaseManager.saveTurtle(turtleId,tPos.x, tPos.y+1, tPos.z, tPos.d);
    if(data.response == "down")      await DatabaseManager.saveTurtle(turtleId,tPos.x, tPos.y-1, tPos.z, tPos.d);
    if(tPos.d == 0) {
      if(data.response == "forward") await DatabaseManager.saveTurtle(turtleId,tPos.x, tPos.y, tPos.z+1, tPos.d);
      if(data.response == "back")    await DatabaseManager.saveTurtle(turtleId,tPos.x, tPos.y, tPos.z-1, tPos.d);
    }
    if(tPos.d == 1) {
      if(data.response == "forward") await DatabaseManager.saveTurtle(turtleId,tPos.x-1, tPos.y, tPos.z, tPos.d);
      if(data.response == "back")    await DatabaseManager.saveTurtle(turtleId,tPos.x+1, tPos.y, tPos.z, tPos.d);
    }
    if(tPos.d == 2) {
      if(data.response == "forward") await DatabaseManager.saveTurtle(turtleId,tPos.x, tPos.y, tPos.z-1, tPos.d);
      if(data.response == "back")    await DatabaseManager.saveTurtle(turtleId,tPos.x, tPos.y, tPos.z+1, tPos.d);
    }
    if(tPos.d == 3) {
      if(data.response == "forward") await DatabaseManager.saveTurtle(turtleId,tPos.x+1, tPos.y, tPos.z, tPos.d);
      if(data.response == "back")    await DatabaseManager.saveTurtle(turtleId,tPos.x-1, tPos.y, tPos.z, tPos.d);
    }
    electronManager.getMainWindow().webContents.send("turtle-move", await DatabaseManager.getTurtle(turtleId));
  },

  async handleTurtleMessageTurn(turtleId: number, data: any) {
    const tPos = await DatabaseManager.getTurtle(turtleId);
    let newDirection;
    if(data.response == "left") {
      newDirection = tPos.d-1;
      if(newDirection == -1) newDirection = 3;
    }
    if(data.response == "right") { 
      newDirection = tPos.d+1;
      if(newDirection == 4) newDirection = 0;
    }
    await DatabaseManager.saveTurtle(turtleId,tPos.x, tPos.y, tPos.z, newDirection);
    electronManager.getMainWindow().webContents.send("turtle-turn", newDirection);
  },

  async handleTurtleMessageWorld(turtleId: number, data: any) {
    const tPos = await DatabaseManager.getTurtle(turtleId);
    if(data.response.blockU)  await DatabaseManager.saveBlock(tPos.x, tPos.y+1, tPos.z, data.response.blockU.name, data.response.blockU.color);
    if(data.response.blockD)  await DatabaseManager.saveBlock(tPos.x, tPos.y-1, tPos.z, data.response.blockD.name, data.response.blockD.color);
    if(tPos.d == 0) {
      if(data.response.blockF) await DatabaseManager.saveBlock(tPos.x, tPos.y, tPos.z+1, data.response.blockF.name, data.response.blockF.color);
      if(data.response.blockB) await DatabaseManager.saveBlock(tPos.x, tPos.y, tPos.z-1, data.response.blockB.name, data.response.blockB.color);
      if(data.response.blockL) await DatabaseManager.saveBlock(tPos.x+1, tPos.y, tPos.z, data.response.blockL.name, data.response.blockL.color);
      if(data.response.blockR) await DatabaseManager.saveBlock(tPos.x-1, tPos.y, tPos.z, data.response.blockR.name, data.response.blockR.color);
    }
    if(tPos.d == 1) {
      if(data.response.blockF) await DatabaseManager.saveBlock(tPos.x-1, tPos.y, tPos.z, data.response.blockF.name, data.response.blockF.color);
      if(data.response.blockB) await DatabaseManager.saveBlock(tPos.x+1, tPos.y, tPos.z, data.response.blockB.name, data.response.blockB.color);
      if(data.response.blockL) await DatabaseManager.saveBlock(tPos.x, tPos.y, tPos.z+1, data.response.blockL.name, data.response.blockL.color);
      if(data.response.blockR) await DatabaseManager.saveBlock(tPos.x, tPos.y, tPos.z-1, data.response.blockR.name, data.response.blockR.color);
    }
    if(tPos.d == 2) {
      if(data.response.blockF) await DatabaseManager.saveBlock(tPos.x, tPos.y, tPos.z-1, data.response.blockF.name, data.response.blockF.color);
      if(data.response.blockB) await DatabaseManager.saveBlock(tPos.x, tPos.y, tPos.z+1, data.response.blockB.name, data.response.blockB.color);
      if(data.response.blockL) await DatabaseManager.saveBlock(tPos.x-1, tPos.y, tPos.z, data.response.blockL.name, data.response.blockL.color);
      if(data.response.blockR) await DatabaseManager.saveBlock(tPos.x+1, tPos.y, tPos.z, data.response.blockR.name, data.response.blockR.color);
    }
    if(tPos.d == 3) {
      if(data.response.blockF) await DatabaseManager.saveBlock(tPos.x+1, tPos.y, tPos.z, data.response.blockF.name, data.response.blockF.color);
      if(data.response.blockB) await DatabaseManager.saveBlock(tPos.x-1, tPos.y, tPos.z, data.response.blockB.name, data.response.blockB.color);
      if(data.response.blockL) await DatabaseManager.saveBlock(tPos.x, tPos.y, tPos.z-1, data.response.blockL.name, data.response.blockL.color);
      if(data.response.blockR) await DatabaseManager.saveBlock(tPos.x, tPos.y, tPos.z+1, data.response.blockR.name, data.response.blockR.color);
    }
    const worldData = await DatabaseManager.getFullWorld();
    if(worldData) electronManager.getMainWindow().webContents.send("initial-world-load", worldData);
    // TODO change to only send relevant blocks
  },

  async handleTurtleMessageInventory(turtleId: number, data: any) {
    electronManager.getMainWindow().webContents.send("turtle-inventory", data.response);
  }
}

function setupCommandListener() {
  ipcMain.on("send-command", (event, { id, type, content }) => {
  const targetWs = turtles.get(id);
  if(targetWs) targetWs.send(JSON.stringify({ type: type, content: content }));
  else {
    console.error(`[ERROR] Turtle ${id} not found`);
    electronManager.getMainWindow().webContents.send("ui-locked", false);
  }
});
}