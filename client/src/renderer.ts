// @ts-nocheck
import { ipcRenderer } from "electron";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let direction: number = 0;

// Lock input
function lockUI(isLocked: boolean) {
  const interactiveElements = document.querySelectorAll('button, input');
  interactiveElements.forEach(el => {
    if (isLocked) {
      el.setAttribute('disabled', 'true');
      el.style.opacity = '0.5';
      el.style.pointerEvents = 'none';
    } else {
      el.removeAttribute('disabled');
      el.style.opacity = '1';
      el.style.pointerEvents = 'auto';
    }
  });
}
window.electronAPI.onUILocked((isLocked) => {
  lockUI(isLocked);
});

// Handle input
const idInput = document.getElementById("turtleId") as HTMLInputElement;
const cmdInput = document.getElementById("command") as HTMLInputElement;

const sendForward = document.getElementById("sendForward");
const sendBack    = document.getElementById("sendBack");
const sendUp      = document.getElementById("sendUp");
const sendDown    = document.getElementById("sendDown");
const sendLeft    = document.getElementById("sendLeft");
const sendRight   = document.getElementById("sendRight");
const sendBtn     = document.getElementById("sendBtn");
sendForward?.addEventListener("click", () => { 
  lockUI(true);
  window.electronAPI.onSendCommand(parseInt(idInput.value), "move", "forward");
  if(direction == 0) controls.target.set(controls.target.x, controls.target.y, controls.target.z+1);
  if(direction == 1) controls.target.set(controls.target.x+1, controls.target.y, controls.target.z);
  if(direction == 2) controls.target.set(controls.target.x, controls.target.y, controls.target.z-1);
  if(direction == 3) controls.target.set(controls.target.x-1, controls.target.y, controls.target.z);
});
sendBack?.addEventListener("click", () => {
  lockUI(true);
  window.electronAPI.onSendCommand(parseInt(idInput.value), "move", "back");
  if(direction == 0) controls.target.set(controls.target.x, controls.target.y, controls.target.z-1);
  if(direction == 1) controls.target.set(controls.target.x-1, controls.target.y, controls.target.z);
  if(direction == 2) controls.target.set(controls.target.x, controls.target.y, controls.target.z+1);
  if(direction == 3) controls.target.set(controls.target.x+1, controls.target.y, controls.target.z);
});
sendUp?.addEventListener("click", () => { 
  lockUI(true);
  window.electronAPI.onSendCommand(parseInt(idInput.value), "move", "up");
  controls.target.set(controls.target.x, controls.target.y+1, controls.target.z);
});
sendDown?.addEventListener("click", () => {
  lockUI(true);
  window.electronAPI.onSendCommand(parseInt(idInput.value), "move", "down");
  controls.target.set(controls.target.x, controls.target.y-1, controls.target.z);
});
sendLeft?.addEventListener("click", () => {
  lockUI(true);
  window.electronAPI.onSendCommand(parseInt(idInput.value), "turn", "left");
  direction = direction-1;
  if(direction == -1) direction = 3;
});
sendRight?.addEventListener("click", () => {
  lockUI(true);
  window.electronAPI.onSendCommand(parseInt(idInput.value), "turn", "right");
  direction = direction+1;
  if(direction == 4) direction = 0;
});
sendBtn?.addEventListener("click", () => {
  lockUI(true);
  window.electronAPI.onSendCommand(parseInt(idInput.value), "eval", cmdInput.value);
});

// Handle 3D
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Add a simple object
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

controls.mouseButtons = {
  LEFT: THREE.MOUSE.PAN,
  MIDDLE: THREE.MOUSE.DOLLY, 
  RIGHT: THREE.MOUSE.ROTATE
};
controls.enablePan = false;
controls.target.set(0, 0, 0);
camera.position.z = 5;

window.electronAPI.onWorldData((data) => {
  console.log(data.response);
  // Update 3D objects here
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();