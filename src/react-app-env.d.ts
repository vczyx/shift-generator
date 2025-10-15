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
      shift: string
    ) => void;
    getDataInfo: () => Promise<IpcResponse<GetDataInfoResponse>>;
    getShift: (
      brand: string,
      area: string,
      restaurant: string,
      shift: string
    ) => Promise<IpcResponse<Shift>>;
    getBrandConfig: (brand: string) => Promise<IpcResponse<BrandConfig>>;
    getDirectoryInfo: (path: string) => Promise<IpcResponse<DirectoryInfo>>;
    showMsgBox: (
      option: MessageBoxOptions
    ) => Promise<IpcResponse<MessageBoxReturnValue>>;
  };
}
