// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

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
    date: string,
    shift: string
  ) => ipcRenderer.invoke("open-editor", brand, area, restaurant, date, shift),
  getDataInfo: () => ipcRenderer.invoke("get-data-info"),
  getShift: (
    brand: string,
    area: string,
    restaurant: string,
    date: string,
    shift: string
  ) => ipcRenderer.invoke("get-shift", brand, area, restaurant, date, shift),
  getBrandConfig: (brand: string) =>
    ipcRenderer.invoke("get-brand-config", brand),
  getDirectoryInfo: (path: string) =>
    ipcRenderer.invoke("get-directoryinfo", path),
  showMsgBox: (option: any, winId: number) =>
    ipcRenderer.invoke("show-msgbox", option, winId),
  setWindowSize: (winId: number, args: { width: number; height: number }) =>
    ipcRenderer.invoke("set-window-size", winId, args),
  openDevTool: (winId: number) => ipcRenderer.invoke("open-dev-tool", winId),
  closeWindow: (winId: number) => ipcRenderer.invoke("close-window", winId),
  onAskSave: (callback: (event: any) => void) =>
    ipcRenderer.on("ask-save", callback),
});
