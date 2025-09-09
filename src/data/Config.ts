import { OperationSymbol } from '../utils/util';
import TestData from "../test/TestData";

export interface RestrauntConfig {
  brand: string;
  name: string;
  roles: string[];
  positions: string[];
  restTime: RestTimeConfig[];
}

export interface RestTimeConfig {
  condition: number;
  operator: OperationSymbol;
  restTime: number;
}
export interface BranchConfig {}

export interface Config {
  Restaurant: RestrauntConfig;
  Branches: BranchConfig[];
}

// Todo : convert to json and file io
export let currentConfig: Config = TestData;
