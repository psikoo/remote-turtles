import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { SSAOPass } from "three/examples/jsm/postprocessing/SSAOPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let composer: any;
let controls: any;

export const SceneManager = {
  getScene: () => scene,
  getCamera: () => camera,
  getRenderer: () => renderer,
  getComposer: () => composer,
  getControls: () => controls,

  init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer = new EffectComposer(renderer);

    setupRenderer();
    setupPostprocessing();
    setupRaycastTooltip();
    setupCamera();
    setupControls();
    setupLighting();
  },
}

function setupRenderer() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
  });
}

function setupPostprocessing() {
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const ssaoPass = new SSAOPass(scene, camera, window.innerWidth, window.innerHeight);
  ssaoPass.kernelRadius = 10; 
  ssaoPass.minDistance = 0.001;
  ssaoPass.maxDistance = 0.05;
  // ssaoPass.output = SSAOPass.OUTPUT.SSAO;
  composer.addPass(ssaoPass);

  const outputPass = new OutputPass();
  composer.addPass(outputPass);
}

function setupRaycastTooltip() {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const tooltip = document.getElementById("tooltip");
  window.addEventListener("mousemove", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
      tooltip.style.display = "unset";
      tooltip.innerHTML = intersects[0].object.name;
    } 
    else { tooltip.style.display = "none"; }
  });
}

function setupCamera() {
  camera.position.y = 5;
  camera.position.x = 5;
  camera.position.z = -5;
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

function setupLighting() {
  scene.add(new THREE.AmbientLight(0xffffff, 1));
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(5, 5, -5);
  scene.add(directionalLight);
}