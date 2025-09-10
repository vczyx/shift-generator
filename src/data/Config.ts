import { OperationSymbol } from "../utils/util";
import TestData from "../test/TestData";

export interface RestrauntConfig {
  /**
   * Restraunt의 Brand
   */
  brand: string;
  /**
   * Restraunt의 지점명
   */
  name: string;
  /**
   * 직급 설정
   */
  roles: string[];
  /**
   * 세부 직급 (key: 직급, value: 세부 직급 설정 )
   */
  roleDetails: { [key: string]: string[] };
  /**
   * 담당 포지션 설정
   */
  positions: string[];
  /**
   * 다중 담당 포지션 표시 사항 설정
   */
  multiPositionDisplay: { [key: number]: string };
  /**
   * 휴게 시간 조건 설정
   */
  restTime: RestTimeConfig[];
  /**
   * Restaurant 운영 시작 시간 (preparing time 포함)
   */
  operatingStart: number;
  /**
   * Restaurant 운영 종료 시간 (cleaning time 포함)
   */
  operationgEnd: number;
}

export interface RestTimeConfig {
  /**
   * 휴게 시간이 주어지는 조건 (피연산자)
   */
  condition: number;
  /**
   * 휴게 시간을 계산할 연산자 (LValue : PartTime's Total Time, RValue : condition)
   */
  operator: OperationSymbol;
  /**
   * 조건이 맞을 때 부여할 휴게 시간 설정
   */
  restTime: number;
}

/**
 * 환경 설정 interface
 */
export interface Config {
  /**
   * Restaurant 설정
   */
  Restaurant: RestrauntConfig;
}

// Todo : convert to json and file io
/**
 * 현재 환경 설정을 가져옵니다.
 */
export let currentConfig: Config = TestData;
