import * as THREE from 'three';

import { SceneManager } from '.';

const geometry = new THREE.BoxGeometry(1, 1, 1);
const blockMeshes = new Map();
const ignoredNames = ["minecraft:air"];

export const WorldManager = {
  init() {
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
      if(name === "minecraft:air") {
        scene.remove(blockMeshes.get(`${x},${y},${z}`));
        blockMeshes.delete(`${x},${y},${z}`)
      }
      else return;
    }
    // ignore list
    for(const ignoredName of ignoredNames) {
      if(name == ignoredName) { return; }
    }

    const material = new THREE.MeshBasicMaterial({ color: colorD });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.name = name;
    scene.add(mesh);
    blockMeshes.set(`${x},${y},${z}`, mesh);
    //console.log(x + "(x)" + y + "(y)" + z + "(z)" + name)
  }
}

function setupWorldDataListeners() {
  // @ts-ignore
  window.electronAPI.onInitialLoad((worldData: any) => {
    for (const block in worldData) {
      const [x, y, z] = block.split(',').map(Number);
      const data = worldData[block];
      WorldManager.spawnBlock(x, y, z, data.name, data.color);
    }
  });
  // @ts-ignore
  window.electronAPI.onWorldData((worldData: any) => {
    for (const block in worldData) {
      const [x, y, z] = block.split(',').map(Number);
      const data = worldData[block];
      WorldManager.spawnBlock(x, y, z, data.name, data.color);
    }
  });
}