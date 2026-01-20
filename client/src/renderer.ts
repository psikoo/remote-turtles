// @ts-nocheck
import { ipcRenderer } from "electron";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

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

// Update position and direction
let direction: number = 0;
let position: any = null;
window.electronAPI.onMove((pos) => {
  position = pos;
  controls.target.set(position.x, position.y, position.z);
});
window.electronAPI.onTurn((d) => {
  direction = d;
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
});
sendBack?.addEventListener("click", () => {
  lockUI(true);
  window.electronAPI.onSendCommand(parseInt(idInput.value), "move", "back");
});
sendUp?.addEventListener("click", () => { 
  lockUI(true);
  window.electronAPI.onSendCommand(parseInt(idInput.value), "move", "up");
});
sendDown?.addEventListener("click", () => {
  lockUI(true);
  window.electronAPI.onSendCommand(parseInt(idInput.value), "move", "down");
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

controls.mouseButtons = {
  LEFT: THREE.MOUSE.PAN,
  MIDDLE: THREE.MOUSE.DOLLY, 
  RIGHT: THREE.MOUSE.ROTATE
};
controls.enablePan = false;
controls.target.set(0, 0, 0);
camera.position.z = -5;

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const geometry = new THREE.BoxGeometry(1, 1, 1);
const blockMeshes = new Map();
function spawnBlock(x, y, z, name, colorID) {  
  if(blockMeshes.has(`${x},${y},${z}`)) {
    if(name === "minecraft:air") {
      scene.remove(blockMeshes.get(`${x},${y},${z}`));
      blockMeshes.delete(`${x},${y},${z}`)
    }
    else return;
  }
  if(name === "minecraft:air") { return; }
  console.log(x + "(x)" + y + "(y)" + z + "(z)" + name)

  //const material = new THREE.MeshLambertMaterial(); //{ color: "#" + color.toString(16) }
  const material = new THREE.MeshNormalMaterial();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  scene.add(mesh);
  blockMeshes.set(`${x},${y},${z}`, mesh);
}

window.electronAPI.onInitialLoad((worldData) => {
  for(const [coords, info] of Object.entries(worldData)) {
    const [x, y, z] = coords.split(',').map(Number);
    spawnBlock(x, y, z, info.name, info.color);
  }
});

window.electronAPI.onWorldData((data) => {
  console.log(data)
  for(const [coords, info] of Object.entries(data)) {
    const [x, y, z] = coords.split(',').map(Number);
    spawnBlock(x, y, z, info.name, info.color);
  }
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();