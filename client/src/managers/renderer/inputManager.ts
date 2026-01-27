import { SceneManager, UiManager, WorldManager } from ".";

let idInput: number = 0;
let direction: number = 0;
let position: {x: number, y: number, z: number} = {x: 0, y: 0, z: 0};

export const InputManager = {
  init() {
    setupListeners();
    setupEvalListeners();
    setupFuelListeners();
    setupSlotListeners();
    setupInventoryListeners();
    setupMoveListeners();
    setupTurnListeners();
    setupMineListeners();
    setupPlaceListeners();
  },
}

function setupListeners() {
  // @ts-ignore
  window.electronAPI.onId((id: number) => {
    idInput = id
  });
  // @ts-ignore
  window.electronAPI.onMove((pos: Vector3) => {
    position = pos;
    WorldManager.moveTurtle(pos.x, pos.y, pos.z);
    SceneManager.getControls().target.set(position.x, position.y, position.z);
  });
  // @ts-ignore
  window.electronAPI.onTurn((dir: number) => {
    direction = dir;
    WorldManager.turnTurtle(dir);
  });
  // @ts-ignore
  window.electronAPI.onFuel((fuel: string) => {
    document.getElementById("fuel").innerText = "Fuel: "+fuel;
  });
  // @ts-ignore
  window.electronAPI.onSlot((slot: number) => {
    document.getElementById("s"+slot).style.backgroundColor = "#dab1da";
  });
  // @ts-ignore
  window.electronAPI.onInventory((inventory: {[key:string]:{name:string; count:number; nbt?:string; }}) => {
    const inventoryArray: any[] = Object.entries(inventory).map(([key, value]) => ({ slot: key, ...value }));
    for(let i = 1; i <= 16; i++) {
      const button = document.getElementById("s"+i); 
      button.textContent = "";
      button.title = "";    
    }
    for(let i = 0; i < inventoryArray.length; i++) {
      const button = document.getElementById(inventoryArray[i].slot); 
      button.textContent = inventoryArray[i].count;
      button.title = inventoryArray[i].name;
    }
  });
}

function setupEvalListeners() {
  const cmdInput = document.getElementById("command");
  const sendEval = document.getElementById("sendEval");
  sendEval?.addEventListener("click", () => {
    UiManager.lockUI(true); // @ts-ignore
    window.electronAPI.onSendCommand(idInput, "eval", cmdInput.value);
  });
}

function setupFuelListeners() {
  const fuel = document.getElementById("fuel");
  const refuel = document.getElementById("refuel");
  fuel?.addEventListener("click", () => {
    UiManager.lockUI(true); // @ts-ignore
    window.electronAPI.onSendCommand(idInput, "fuel", "fuel");
  });
  refuel?.addEventListener("click", () => {
    UiManager.lockUI(true); // @ts-ignore
    window.electronAPI.onSendCommand(idInput, "fuel", "refuel");
  });
}

function setupSlotListeners() {
  for(let i = 1; i <= 16; i++) {
    document.getElementById("s"+i)?.addEventListener("click", () => {
      for(let i = 1; i <= 16; i++) {
        document.getElementById("s"+i).style.backgroundColor = "white";
      }
      UiManager.lockUI(true); // @ts-ignore
      window.electronAPI.onSendCommand(idInput, "slot", i);
    });
  }
}

function setupInventoryListeners() {
  const drop = document.getElementById("drop");
  const drop1 = document.getElementById("drop1");
  const drop8 = document.getElementById("drop8");
  const drop16 = document.getElementById("drop16");
  const drop32 = document.getElementById("drop32");
  const suck = document.getElementById("suck");
  const suck1 = document.getElementById("suck1");
  const suck8 = document.getElementById("suck8");
  const suck16 = document.getElementById("suck16");
  const suck32 = document.getElementById("suck32");
  const craft = document.getElementById("craft");
  const craft1 = document.getElementById("craft1");
  const craft8 = document.getElementById("craft8");
  const craft16 = document.getElementById("craft16");
  const craft32 = document.getElementById("craft32");
  drop?.addEventListener("click", () => { 
    UiManager.lockUI(true); // @ts-ignore
    window.electronAPI.onSendCommand(idInput, "item", "drop");
  });
  drop1?.addEventListener("click", () => { 
    UiManager.lockUI(true); // @ts-ignore
    window.electronAPI.onSendCommand(idInput, "item", "drop1");
  });
  drop8?.addEventListener("click", () => { 
    UiManager.lockUI(true); // @ts-ignore
    window.electronAPI.onSendCommand(idInput, "item", "drop8");
  });
  drop16?.addEventListener("click", () => { 
    UiManager.lockUI(true); // @ts-ignore
    window.electronAPI.onSendCommand(idInput, "item", "drop16");
  });
  drop32?.addEventListener("click", () => { 
    UiManager.lockUI(true); // @ts-ignore
    window.electronAPI.onSendCommand(idInput, "item", "drop32");
  });
  suck?.addEventListener("click", () => { 
    UiManager.lockUI(true); // @ts-ignore
    window.electronAPI.onSendCommand(idInput, "item", "suck");
  });
  suck1?.addEventListener("click", () => { 
    UiManager.lockUI(true); // @ts-ignore
    window.electronAPI.onSendCommand(idInput, "item", "suck1");
  });
  suck8?.addEventListener("click", () => { 
    UiManager.lockUI(true); // @ts-ignore
    window.electronAPI.onSendCommand(idInput, "item", "suck8");
  });
  suck16?.addEventListener("click", () => { 
    UiManager.lockUI(true); // @ts-ignore
    window.electronAPI.onSendCommand(idInput, "item", "suck16");
  });
  suck32?.addEventListener("click", () => { 
    UiManager.lockUI(true); // @ts-ignore
    window.electronAPI.onSendCommand(idInput, "item", "suck32");
  });
  craft?.addEventListener("click", () => { 
    UiManager.lockUI(true); // @ts-ignore
    window.electronAPI.onSendCommand(idInput, "item", "craft");
  });
  craft1?.addEventListener("click", () => { 
    UiManager.lockUI(true); // @ts-ignore
    window.electronAPI.onSendCommand(idInput, "item", "craft1");
  });
  craft8?.addEventListener("click", () => { 
    UiManager.lockUI(true); // @ts-ignore
    window.electronAPI.onSendCommand(idInput, "item", "craft8");
  });
  craft16?.addEventListener("click", () => { 
    UiManager.lockUI(true); // @ts-ignore
    window.electronAPI.onSendCommand(idInput, "item", "craft16");
  });
  craft32?.addEventListener("click", () => { 
    UiManager.lockUI(true); // @ts-ignore
    window.electronAPI.onSendCommand(idInput, "item", "craft32");
  });
}

function setupMoveListeners() {
  const moveForward = document.getElementById("moveForward");
  const moveBack = document.getElementById("moveBack");
  const moveUp = document.getElementById("moveUp");
  const moveDown = document.getElementById("moveDown");
  moveForward?.addEventListener("click", () => { 
    UiManager.lockUI(true); // @ts-ignore
    window.electronAPI.onSendCommand(idInput, "move", "forward");
  });
  moveBack?.addEventListener("click", () => {
    UiManager.lockUI(true); // @ts-ignore
    window.electronAPI.onSendCommand(idInput, "move", "back");
  });
  moveUp?.addEventListener("click", () => { 
    UiManager.lockUI(true); // @ts-ignore
    window.electronAPI.onSendCommand(idInput, "move", "up");
  });
  moveDown?.addEventListener("click", () => {
    UiManager.lockUI(true); // @ts-ignore
    window.electronAPI.onSendCommand(idInput, "move", "down");
  });
}

function setupTurnListeners() {
  const turnLeft = document.getElementById("turnLeft");
  const turnRight = document.getElementById("turnRight");
  turnLeft?.addEventListener("click", () => {
    UiManager.lockUI(true); // @ts-ignore
    window.electronAPI.onSendCommand(idInput, "turn", "left");
    direction = direction-1;
    if(direction == -1) direction = 3;
  });
  turnRight?.addEventListener("click", () => {
    UiManager.lockUI(true); // @ts-ignore
    window.electronAPI.onSendCommand(idInput, "turn", "right");
    direction = direction+1;
    if(direction == 4) direction = 0;
  });
}

function setupMineListeners() {
  const mineUp = document.getElementById("mineUp");
  const mineForward = document.getElementById("mineForward");
  const mineDown = document.getElementById("mineDown");
  mineUp?.addEventListener("click", () => {
    UiManager.lockUI(true); // @ts-ignore
    window.electronAPI.onSendCommand(idInput, "mine", "up");
  });
  mineForward?.addEventListener("click", () => {
    UiManager.lockUI(true); // @ts-ignore
    window.electronAPI.onSendCommand(idInput, "mine", "forward");
  });
  mineDown?.addEventListener("click", () => {
    UiManager.lockUI(true); // @ts-ignore
    window.electronAPI.onSendCommand(idInput, "mine", "down");
  });
}

function setupPlaceListeners() {
  const placeUp = document.getElementById("placeUp");
  const placeForward = document.getElementById("placeForward");
  const placeDown = document.getElementById("placeDown");
  placeUp?.addEventListener("click", () => {
    UiManager.lockUI(true); // @ts-ignore
    window.electronAPI.onSendCommand(idInput, "place", "up");
  });
  placeForward?.addEventListener("click", () => {
    UiManager.lockUI(true); // @ts-ignore
    window.electronAPI.onSendCommand(idInput, "place", "forward");
  });
  placeDown?.addEventListener("click", () => {
    UiManager.lockUI(true); // @ts-ignore
    window.electronAPI.onSendCommand(idInput, "place", "down");
  });
}
