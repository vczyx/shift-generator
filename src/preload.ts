// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { MessageBoxOptions, contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  readFile: (filePath: string, currentDirPath: boolean) =>
    ipcRenderer.invoke("read-file", filePath, currentDirPath),
  writeFile: (filePath: string, content: string, currentDirPath: boolean) =>
    ipcRenderer.invoke("write-file", filePath, content, currentDirPath),
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
  getDirectoryInfo: (path: string) =>
    ipcRenderer.invoke("get-directoryinfo", path),
  showMsgBox: (option: MessageBoxOptions) =>
    ipcRenderer.invoke("show-msgbox", option),
});
