const { WebSocketServer } = require("ws");

import { DatabaseManager, electronManager, TurtleManager } from "./managers/main";

electronManager.init(false);
DatabaseManager.init();
TurtleManager.init();

const wss = new WebSocketServer({ port: 8080 });
let turtleId: number = 0;

wss.on("connection", async (ws: any) => {
  ws.on("message", async (msg: string) => {
    const data = JSON.parse(msg.toString());
    if(data.type === "handshake") turtleId = await TurtleManager.handleHandshake(ws, data);
    if(turtleId == null) return;
    // Add message to queue
    console.log("[WS"+turtleId+"] "+data.type);
    const nextInQueue = TurtleManager.getMessageQueue(turtleId).then(async () => {
      try { 
        if(data.type === "response")       { await TurtleManager.handleTurtleMessageResponse(turtleId, data); }
        else if(data.type === "fuel")      { await TurtleManager.handleTurtleMessageFuel(turtleId, data); }
        else if(data.type === "slot")      { await TurtleManager.handleTurtleMessageSlot(turtleId, data); }
        else if(data.type === "move")      { await TurtleManager.handleTurtleMessageMove(turtleId, data); }
        else if(data.type === "turn")      { await TurtleManager.handleTurtleMessageTurn(turtleId, data); }
        else if(data.type === "world")     { await TurtleManager.handleTurtleMessageWorld(turtleId, data); }
        else if(data.type === "inventory") { await TurtleManager.handleTurtleMessageInventory(turtleId, data); }
      } 
      catch (err) { console.error(`[ERROR] Turtle ${turtleId} cant process message:`, err); }
    });
    TurtleManager.setMessageQueue(turtleId, nextInQueue);
  });
  ws.on("close", () => {
    TurtleManager.removeTurtle(turtleId);
  })
});