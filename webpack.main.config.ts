import type { Configuration } from "webpack";

import { rules } from "./webpack.rules";
import { plugins } from "./webpack.plugins";
import path from "path";

export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: {
    main: "./src/index.ts",
    preload: "./src/preload.ts",
  },
  output: {
    filename: "[name].js", // ✔️ 엔트리 이름에 따라 파일 이름 자동 설정
    path: path.resolve(__dirname, ".webpack/main"),
  },
  // Put your normal webpack config below here
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".json"],
  },
};
