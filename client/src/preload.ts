import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  sendTurtleCommand: (id: number, type: string, content: string) => 
    ipcRenderer.send('send-to-turtle', { id, type, content })
});