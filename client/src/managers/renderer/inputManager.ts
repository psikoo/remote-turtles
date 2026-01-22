import { SceneManager, UiManager, WorldManager } from ".";

let idInput: number = 3;
let direction: number = 0;
let position: {x: number, y: number, z: number} = {x: 0, y: 0, z: 0};

export const InputManager = {
  init() {
    setupListeners();
    setupEvalListeners();
    setupFuelListeners();
    setupSlotListeners();
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
    document.getElementById("inv"+slot).style.backgroundColor = "#dab1da";
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
    document.getElementById("inv"+i)?.addEventListener("click", () => {
      for(let i = 1; i <= 16; i++) {
        document.getElementById("inv"+i).style.backgroundColor = "white";
      }
      UiManager.lockUI(true); // @ts-ignore
      window.electronAPI.onSendCommand(idInput, "slot", i);
    });
  }
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
