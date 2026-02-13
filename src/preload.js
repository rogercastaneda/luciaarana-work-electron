// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('r2Api', {
  upload: async (fileBuffer, filename, contentType) => {
    return ipcRenderer.invoke('r2:upload', fileBuffer, filename, contentType);
  },
  delete: async (filename) => {
    return ipcRenderer.invoke('r2:delete', filename);
  }
});
