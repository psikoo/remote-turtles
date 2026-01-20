import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  onSendCommand: (id: number, type: string, content: string) => 
    ipcRenderer.send("send-command", { id, type, content }),

  onWorldData: (callback: any) => 
    ipcRenderer.on("world-data", (event, value) => callback(value)),

  onUILocked: (callback: any) => 
    ipcRenderer.on("ui-locked", (event, isLocked) => callback(isLocked))
});