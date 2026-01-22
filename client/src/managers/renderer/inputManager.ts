import { SceneManager, UiManager } from '.';

let idInput: number;
let direction: number = 0;
let position: {x: number, y: number, z: number} = {x: 0, y: 0, z: 0};

export const InputManager = {
  init() {
    idInput = parseInt((document.getElementById("turtleId") as HTMLInputElement).value);
    setupMoveAndDirectionListeners();
    setupEvalListeners();
    setupMoveListeners();
    setupTurnListeners();
  },
}

function setupMoveAndDirectionListeners() {
  // @ts-ignore
  window.electronAPI.onMove((pos: Vector3) => {
    position = pos;
    SceneManager.getControls().target.set(position.x, position.y, position.z);
  });
  // @ts-ignore
  window.electronAPI.onTurn((dir: number) => {
    direction = dir;
  });
}

function setupEvalListeners() {
  const cmdInput = document.getElementById("command");
  const sendBtn = document.getElementById("sendBtn");
  sendBtn?.addEventListener("click", () => {
    UiManager.lockUI(true); // @ts-ignore
    window.electronAPI.onSendCommand(idInput, "eval", cmdInput.value);
  });
}

function setupMoveListeners() {
  const sendForward = document.getElementById("sendForward");
  const sendBack = document.getElementById("sendBack");
  const sendUp = document.getElementById("sendUp");
  const sendDown = document.getElementById("sendDown");
  sendForward?.addEventListener("click", () => { 
    UiManager.lockUI(true); // @ts-ignore
    window.electronAPI.onSendCommand(idInput, "move", "forward");
  });
  sendBack?.addEventListener("click", () => {
    UiManager.lockUI(true); // @ts-ignore
    window.electronAPI.onSendCommand(idInput, "move", "back");
  });
  sendUp?.addEventListener("click", () => { 
    UiManager.lockUI(true); // @ts-ignore
    window.electronAPI.onSendCommand(idInput, "move", "up");
  });
  sendDown?.addEventListener("click", () => {
    UiManager.lockUI(true); // @ts-ignore
    window.electronAPI.onSendCommand(idInput, "move", "down");
  });
}

function setupTurnListeners() {
  const sendLeft = document.getElementById("sendLeft");
  const sendRight = document.getElementById("sendRight");
  sendLeft?.addEventListener("click", () => {
    UiManager.lockUI(true); // @ts-ignore
    window.electronAPI.onSendCommand(idInput, "turn", "left");
    direction = direction-1;
    if(direction == -1) direction = 3;
  });
  sendRight?.addEventListener("click", () => {
    UiManager.lockUI(true); // @ts-ignore
    window.electronAPI.onSendCommand(idInput, "turn", "right");
    direction = direction+1;
    if(direction == 4) direction = 0;
  });
}