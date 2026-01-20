// @ts-nocheck
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

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
  window.electronAPI.sendTurtleCommand(parseInt(idInput.value), "move", "forward");
});
sendBack?.addEventListener("click", () => {
  window.electronAPI.sendTurtleCommand(parseInt(idInput.value), "move", "back");
});
sendUp?.addEventListener("click", () => {
  window.electronAPI.sendTurtleCommand(parseInt(idInput.value), "eval", "turtle.up()");
});
sendDown?.addEventListener("click", () => {
  window.electronAPI.sendTurtleCommand(parseInt(idInput.value), "eval", "turtle.down()");
});
sendLeft?.addEventListener("click", () => {
  window.electronAPI.sendTurtleCommand(parseInt(idInput.value), "eval", "turtle.turnLeft()");
});
sendRight?.addEventListener("click", () => {
  window.electronAPI.sendTurtleCommand(parseInt(idInput.value), "eval", "turtle.turnRight()");
});
sendBtn?.addEventListener("click", () => {
  window.electronAPI.sendTurtleCommand(iparseInt(idInput.value), "eval", cmdInput.value);
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

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();