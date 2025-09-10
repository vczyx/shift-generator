import {
  intervalToDuration,
  Duration,
  isAfter,
  differenceInDays,
} from "date-fns";
import { PartTime } from "./PartTime";
import util from "../utils/util";

/**
 * 근무 시간 종류
 */
export type WorkTypes = "fixed" | "variable";

/**
 * 요일 종류
 */
export type WeekDays = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

/**
 * 시간 (0-24)
 */
export type Hour =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24;

/**
 * 시간 별 Ticket Count 타입
 */
export type TCList = Record<Hour, number>;

/**
 * 근무자 인적 사항
 */
export interface Worker {
  /**
   * 이름
   */
  name: string;

  /**
   * 직급
   */
  role: string;

  /**
   * 세부 직급
   */
  roleDetail: string;

  /**
   * 담당 가능한 포지션
   */
  position: string[];

  /**
   * 입사 날짜
   */
  joinDate: Date;

  /**
   * 보건증 만기일
   */
  healthCertExpiryDate: Date;

  /**
   * 시간 당 TC 커버리지 율
   */
  tcCoveragePerHour: number;

  /**
   * 최대 근로 가능 시간 (사용자 지정)
   */
  maxWorkTime: number;

  /**
   * 최소 근로 가능 시간 (사용자 지정)
   */
  minWorkTime: number;

  /**
   * 근무 시간 종류
   *  - fixed : 고정 시간표
   *  - variable 가변 시간표
   */
  workType: WorkTypes;

  /**
   * 고정 시간표
   */
  fixedShift: Record<WeekDays, PartTime>;
}

export interface Day {
  /**
   * 일정
   */
  descriptions: string;

  /**
   * 목표 매출
   */
  targetSales: number;

  /**
   * 예상 매출
   */
  expectedSales: number;

  /**
   * 목표 사용 시간 (직원)
   */
  targetUsageTimeMgr: number;

  /**
   * 목표 사용 시간 (파트타이머)
   */
  targetUsageTimePt: number;

  expectedTC: TCList;

  workers: { [workerId: number]: PartTime };
}

export interface Week {
  /**
   * 요일 설정
   */
  days: Record<WeekDays, Day>;
}

export interface Shift {
  week: Week;
}

export const ShiftF = {
  /**
   * 해당 근무자의 근속 기한을 가져옵니다.
   * @param w 근무자 인적 정보
   * @param format 반환할 형식을 지정 합니다.
   * - "[yy]" : 년
   * - "[mm]" : 개월
   * - "[ww]" : 주
   * - "[dd]" : 일
   * - "[h]" : 시간
   * - "[m]" : 분
   * - "[s]" : 초
   */
  getWorkDuration: (w: Worker, format: string = "[yy]년 [mm]개월"): string => {
    let duration: Duration;
    const formatSet = {
      "[yy]": () => `${duration?.years ?? "0"}`,
      "[mm]": () => `${duration?.months ?? "0"}`,
      "[ww]": () => `${duration?.weeks ?? "0"}`,
      "[dd]": () => `${duration?.days ?? "0"}`,
      "[h]": () => `${duration?.hours ?? "0"}`,
      "[m]": () => `${duration?.minutes ?? "0"}`,
      "[s]": () => `${duration?.seconds ?? "0"}`,
    };
    const now = new Date();
    if (isAfter(now, w.joinDate)) {
      duration = intervalToDuration({ start: w.joinDate, end: now });
    }
    return util.formater(format, formatSet);
  },

  /**
   * 해당 근무자의 보건증 잔여일을 가져옵니다.
   * @param w 근무자 인적 정보
   * @returns 보건증 잔여일
   */
  getHealthCertDaysLeft: (w: Worker): number => {
    return differenceInDays(w.healthCertExpiryDate, new Date());
  },
};
