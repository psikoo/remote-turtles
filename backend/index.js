const { WebSocketServer } = require("ws");
const readline = require("readline");
const { JsonDB, Config } = require("node-json-db");

const turtleDB = new JsonDB(new Config("turtle", true, true, "/db"));
const ws = new WebSocketServer({ port: 8080 });
const turtles = new Map(); 

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

ws.on("connection", (ws) => {
  let turtleId = null;
  ws.on("message", (msg) => {
    const data = JSON.parse(msg.toString());
    
    if(data.type === "handshake") {
      turtleId = data.id;
      turtles.set(turtleId, ws);
      console.log(`[Connected] Turtle ${turtleId}`);
      process.stdout.write("> ");
    }

    if(data.type === "response") {
      console.log(`[Turtle ${turtleId}]: ${JSON.stringify(data)}`);
      process.stdout.write("> ");
    }
  });
  ws.on("close", () => console.log(`[Disconnected] Turtle ${turtleId}`));
});

rl.on("line", (line) => {
  const [id, type, content] = line.split(":");
  const targetWs = turtles.get(parseInt(id));
  if(targetWs) {
    targetWs.send(JSON.stringify({ type: type, content: content }));
    console.log(`[Sent T${id}] "${content}"`);
  } else {
    console.log(`[ERROR] ${id} not found. Active IDs: ${Array.from(turtles.keys())}`);
  }
});

console.log("WS running on port 8080");