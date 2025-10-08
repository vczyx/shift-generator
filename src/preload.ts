// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  readFile: (filePath: string) => ipcRenderer.invoke("read-file", filePath),
  writeFile: (filePath: string, content: string) =>
    ipcRenderer.invoke("write-file", { filePath, content }),
  openFileDialog: () => ipcRenderer.invoke("open-file-dialog"),
  openEditor: (
    brand: string,
    area: string,
    restaurant: string,
    shift: string
  ) => ipcRenderer.invoke("open-editor", brand, area, restaurant, shift),
  getDataInfo: () => ipcRenderer.invoke("get-data-info"),
  getShift: (brand: string, area: string, restaurant: string, shift: string) =>
    ipcRenderer.invoke("get-shift", brand, area, restaurant, shift),
  getBrandConfig: (brand: string) =>
    ipcRenderer.invoke("get-brand-config", brand),
});
