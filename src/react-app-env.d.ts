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
    openEditor: (
      brand: string,
      area: string,
      restaurant: string,
      date: string,
      shift: string
    ) => number;
    getDataInfo: () => Promise<IpcResponse<GetDataInfoResponse>>;
    getShift: (
      brand: string,
      area: string,
      restaurant: string,
      date: string,
      shift: string
    ) => Promise<IpcResponse<Shift>>;
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
    onAskSave: (callback: () => void) => void;
  };
}
