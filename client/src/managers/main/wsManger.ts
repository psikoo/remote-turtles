import { DatabaseManager, electronManager, TurtleManager } from ".";

const { WebSocketServer } = require("ws");

let wss: any;

export const WsManager = {
  init(port: number) {
    wss = new WebSocketServer({ port: port });
    setupWsListener()
  },
}

function setupWsListener() {
  wss.on("connection", async (ws: any) => {
    let turtleId: number = null;
    ws.on("message", async (msg: string) => {
      const data = JSON.parse(msg.toString());
      
      if(data.type === "handshake") {
        turtleId = data.response;
        TurtleManager.getTurtles().set(turtleId, ws);
        TurtleManager.setMessageQueue(turtleId);
        console.log(`[Connected] Turtle ${turtleId}`);
        if (!await DatabaseManager.getTurtle(turtleId)) {
          await DatabaseManager.saveTurtle(turtleId, 0, 0, 0, 0);
        }
        const turtle = await DatabaseManager.getTurtle(turtleId);
        electronManager.getMainWindow().webContents.send("turtle-move", { x: turtle.x, y: turtle.y, z: turtle.z });
        electronManager.getMainWindow().webContents.send("turtle-turn", turtle.d);
      }
      if (!turtleId) return;
      const currentQueue = TurtleManager.getMessageQueue(turtleId);
      const nextInQueue = currentQueue.then(async () => {
        try { await TurtleManager.handleTurtleMessage(data, turtleId, ws); } 
        catch (err) { console.error(`[ERROR] Turtle ${turtleId} cant process message:`, err); }
      });
      TurtleManager.setMessageQueue(turtleId, nextInQueue);
    });
    ws.on("close", () => console.log(`[Disconnected] Turtle ${turtleId}`));
  });
}