import { OperationSymbol } from "../utils/util";
import { TestConfig } from "../test/TestData";
import { CSSColor } from "../utils/type";

/**
 * 환경 설정 interface
 */
export interface Config {
  /**
   * Restaurant 설정
   */
  Brand: BrandConfig;
}

// Todo : convert to json and file io
/**
 * 현재 환경 설정을 가져옵니다.
 */
export let currentConfig: Config = TestConfig;
