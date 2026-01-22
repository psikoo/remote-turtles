import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: any;

export const SceneManager = {
  getScene: () => scene,
  getCamera: () => camera,
  getRenderer: () => renderer,
  getControls: () => controls,

  init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    setupRenderer();
    setupRaycastTooltip();
    setupControls();
    setupCamera();
  },
}

function setupRenderer() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function setupRaycastTooltip() {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const tooltip = document.getElementById('tooltip');
  window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
      tooltip.style.display = 'unset';
      tooltip.innerHTML = intersects[0].object.name;
    } 
    else { tooltip.style.display = 'none'; }
  });
}

function setupControls() {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.PAN,
    MIDDLE: THREE.MOUSE.DOLLY, 
    RIGHT: THREE.MOUSE.ROTATE
  };
  controls.enablePan = false;
  controls.target.set(0, 0, 0);
}

function setupCamera() {
  camera.position.y = 5;
  camera.position.z = 5;
}