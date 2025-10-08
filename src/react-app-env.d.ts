interface Window {
  electron: {
    readFile: (
      filePath: string
    ) => Promise<{ success: boolean; data?: string; error?: string }>;
    writeFile: (
      filePath: string,
      content: string
    ) => Promise<{ success: boolean; error?: string }>;
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
  };
}
