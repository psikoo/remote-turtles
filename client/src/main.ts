const { WebSocketServer } = require("ws");

import { DatabaseManager, electronManager, TurtleManager } from './managers/main';

electronManager.init(false);
DatabaseManager.init();
TurtleManager.init();

const wss = new WebSocketServer({ port: 8080 });
let turtleId: number = 1;

wss.on("connection", async (ws: any) => {
  ws.on("message", async (msg: string) => {
    const data = JSON.parse(msg.toString());
    if(data.type === "handshake") turtleId = await TurtleManager.handleHandshake(ws, data);
    if(turtleId == null) return;
    // Add messague to queue
    console.log("[WS"+turtleId+"] "+data.type);
    const nextInQueue = TurtleManager.getMessageQueue(turtleId).then(async () => {
      try { 
        if(data.type === "response")   { await TurtleManager.handleTurtleMessageResponse(ws, turtleId, data); }
        else if(data.type === "move")  { await TurtleManager.handleTurtleMessageMove(ws, turtleId, data); }
        else if(data.type === "turn")  { await TurtleManager.handleTurtleMessageTurn(ws, turtleId, data); }
        else if(data.type === "world") { await TurtleManager.handleTurtleMessageWorld(ws, turtleId, data); }
      } 
      catch (err) { console.error(`[ERROR] Turtle ${turtleId} cant process message:`, err); }
    });
    TurtleManager.setMessageQueue(turtleId, nextInQueue);
  });
  ws.on("close", () => console.log(`[Disconnected] Turtle ${turtleId}`));
});