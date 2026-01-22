import * as THREE from "three";

import { SceneManager } from ".";

const geometry = new THREE.BoxGeometry(1, 1, 1);
const turtleGeometry = new THREE.BoxGeometry(0.75, 0.75, 0.75);
const blockMeshes = new Map();
let turtle: any;

const ignoredNames = [
  "minecraft:air", 
  "minecraft:grass", , "minecraft:fern"
];

export const WorldManager = {
  init() {
    createTurtle();
    setupWorldDataListeners();
  },

  spawnBlock(x: number, y: number, z: number, name: string, colorD: number) {
    const scene = SceneManager.getScene(); // Get the active scene 
    if (!scene) {
      console.error("WorldManager: Scene not initialized yet!");
      return;
    }
    // Remove blocks that have disappeared
    if(blockMeshes.has(`${x},${y},${z}`)) {
      const tempMesh = blockMeshes.get(`${x},${y},${z}`);
      if(name === "minecraft:air") {
        scene.remove(tempMesh);
        blockMeshes.delete(`${x},${y},${z}`);
      }
      else if(name !== tempMesh.name) {
        scene.remove(tempMesh);
        blockMeshes.delete(`${x},${y},${z}`);
      }
      else return;
    }
    // ignore list
    for(const ignoredName of ignoredNames) {
      if(name == ignoredName) { return; }
    }

    // const material = new THREE.MeshBasicMaterial({ color: colorD });
    const material = new THREE.MeshLambertMaterial({ color: colorD });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.name = name;
    scene.add(mesh);
    blockMeshes.set(`${x},${y},${z}`, mesh);
    //console.log(x + "(x)" + y + "(y)" + z + "(z)" + name)
  },

  moveTurtle(x: number, y: number, z: number) {
    turtle.position.set(x, y, z);
  },
  turnTurtle(d: number) {
    if     (d == 0) turtle.rotation.y = 0;
    else if(d == 1) turtle.rotation.y = (Math.PI / 2) * 3;
    else if(d == 2) turtle.rotation.y = Math.PI;
    else if(d == 3) turtle.rotation.y = Math.PI / 2;
  }
}

function createTurtle() {
  const materials = [
    new THREE.MeshStandardMaterial({ color: 0xff0000 }), // R
    new THREE.MeshStandardMaterial({ color: 0xff0000 }), // L
    new THREE.MeshStandardMaterial({ color: 0xff0000 }), // T
    new THREE.MeshStandardMaterial({ color: 0xff0000 }), // B
    new THREE.MeshStandardMaterial({ color: 0x0000FF }), // F
    new THREE.MeshStandardMaterial({ color: 0xff0000 })  // B
  ];
  const material = new THREE.MeshLambertMaterial({ color: 0xFF0000 });
  turtle = new THREE.Mesh(turtleGeometry, materials);
  turtle.position.set(0, 0, 0);
  turtle.name = "turtle";
  SceneManager.getScene().add(turtle);
}

function setupWorldDataListeners() {
  // @ts-ignore
  window.electronAPI.onInitialLoad((worldData: any) => {
    for (const block in worldData) {
      const [x, y, z] = block.split(",").map(Number);
      const data = worldData[block];
      WorldManager.spawnBlock(x, y, z, data.name, data.color);
    }
  });
  // @ts-ignore
  window.electronAPI.onWorldData((worldData: any) => {
    for (const block in worldData) {
      const [x, y, z] = block.split(",").map(Number);
      const data = worldData[block];
      WorldManager.spawnBlock(x, y, z, data.name, data.color);
    }
  });
}