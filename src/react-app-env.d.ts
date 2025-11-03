interface Window {
  electron: {
    readFile: (
      filePath: string,
      currentDirPath: boolean = false
    ) => Promise<IpcResponse<string>>;
    writeFile: (
      filePath: string,
      content: string,
      currentDirPath: boolean = false
    ) => Promise<IpcResponse<void>>;
    openFileDialog: () => Promise<string | null>;
    openEditor: (adr: Address) => Promise<IpcResponse<number>>;
    getDataInfo: () => Promise<IpcResponse<GetDataInfoResponse>>;
    getShift: (adr: Address) => Promise<IpcResponse<Shift>>;
    getWorkers: (
      adr: Address
    ) => Promise<IpcResponse<{ [workerId: number]: WorkerInfo }>>;
    getBrandConfig: (brand: string) => Promise<IpcResponse<BrandConfig>>;
    getDirectoryInfo: (path: string) => Promise<IpcResponse<DirectoryInfo>>;
    showMsgBox: (
      option: MessageBoxOptions,
      winId: number
    ) => Promise<IpcResponse<MessageBoxReturnValue>>;
    setWindowSize: (
      winId: number,
      args: { width: number; height: number }
    ) => Promise<IpcResponse<void>>;
    openDevTool: (winId: number) => Promise<IpcResponse<void>>;
    closeWindow: (winId: number) => Promise<IpcResponse<void>>;
    registerShortcut: (
      winId: number,
      items: [shortcut: string, channel: string][]
    ) => Promise<IpcResponse<void>>;
    onAskSave: (callback: () => void) => void;
    clearAskSave: (callback: () => void) => void;
    onShortcut: (channel: string, callback: (event: any) => void) => void;
    clearShortcut: (channel: string, callback: (event: any) => void) => void;
  };
}
