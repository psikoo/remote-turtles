import { contextBridge, ipcRenderer } from "electron";
import { Vector3 } from "three";

contextBridge.exposeInMainWorld("electronAPI", {
  onSendCommand: (id: number, type: string, content: string) => 
    ipcRenderer.send("send-command", { id, type, content }),

  onUILocked: (callback: any) => 
    ipcRenderer.on("ui-locked", (event, isLocked) => callback(isLocked)),


  onId: (callback: any) => 
    ipcRenderer.on("turtle-id", (event, id) => callback(id)),
  onMove: (callback: any) => 
    ipcRenderer.on("turtle-move", (event, position) => callback(position)),
  onTurn: (callback: any) => 
    ipcRenderer.on("turtle-turn", (event, direction) => callback(direction)),

  onInitialLoad: (callback: any) => 
    ipcRenderer.on('initial-world-load', (event, data) => callback(data)),
  onWorldData: (callback: any) => 
    ipcRenderer.on('world-data', (event, data) => callback(data)),
});