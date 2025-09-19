import {
  intervalToDuration,
  Duration,
  isAfter,
  differenceInDays,
} from "date-fns";
import { PartTime, PartTimeF } from "./PartTime";
import util from "../utils/util";
import { TestShiftData } from "../test/TestData";
import { RestaurantRoleConfig, currentConfig } from "./Config";
import { CSSColor } from "../utils/type";

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
   * 목표 사용 시간
   */
  targetUsageTime: number;

  expectedTC: TCList;

  color: CSSColor;

  workers: { [workerId: number]: PartTime };
}

export interface Week {
  /**
   * 요일 설정
   */
  days: Record<WeekDays, Day>;
}

export interface Shift {
  /**
   * 주간 데이터
   */
  week: Week;

  /**
   * 월요일 날짜
   */
  firstDate: Date;

  /**
   * 근무자 데이터
   */
  workers: { [workerId: number]: Worker };
}

/**
 * Shift 데이터와 관련된 확장 함수들을 제공합니다.
 */
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
    // 실제 데이터를 결과로 반환하기 위해, 필터링 문자열과 getter 구현
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

    // 만약 지금 날짜가 입사일 이후 일 경우 (이전일 경우 0을 반환하기 위해서)
    if (isAfter(now, w.joinDate)) {
      duration = intervalToDuration({ start: w.joinDate, end: now });
    }

    // 데이터 filtering 후 반환
    return util.formatFilterer(format, formatSet);
  },

  /**
   * 해당 근무자의 보건증 잔여일을 가져옵니다.
   * @param w 근무자 인적 정보
   * @returns 보건증 잔여일
   */
  getHealthCertDaysLeft: (w: Worker): number => {
    // 현재 날짜 - 보건증 만기일
    return differenceInDays(w.healthCertExpiryDate, new Date());
  },

  /**
   * 해당 근무자의 직급에 대한 세부 정보를 가져옵니다.
   * @param w 근무자 인적 정보
   * @returns 직급에 해당하는 Restaurant의 RoleDetail 데이터
   */
  getRoleData: (w: Worker): RestaurantRoleConfig => {
    return currentConfig.Restaurant.roles[w.role].details[w.roleDetail];
  },

  /**
   * 근무자 Id에 해당하는 근무자 데이터를 가져옵니다.
   * @param wId 근무자 ID
   * @returns Worker Data
   */
  getWorker: (wId: number): Worker | null => {
    return wId === -1 ? null : currentShiftData.workers[wId];
  },

  /**
   * 해당 근무자의 주간 근무 시간을 가져옵니다.
   * @param wId 근무자 ID
   * @returns 주간 근무 시간
   */
  getTotalWorkingTime: (wId: number): number => {
    let total = 0;
    for (const day of Object.values(currentShiftData.week.days)) {
      for (const [workerId, partTime] of Object.entries(day.workers)) {
        if (parseInt(workerId) === wId)
          total += PartTimeF.getWorkTime(partTime);
      }
    }
    return total;
  },

  /**
   * 해당 요일의 계획 시간을 가져옵니다.
   * @param wd 요일
   */
  getWeekPlannedUsageTime: (wd: WeekDays): number => {
    let total = 0;
    for (const pt of Object.values(currentShiftData.week.days[wd].workers))
      total += PartTimeF.getWorkTime(pt);

    return total;
  },

  /**
   * 해당 근무자의 심야 근로 시간을 가져옵니다.
   * @param wId 근무자 ID
   * @returns 심야 근로 시간
   */
  getNightWorkingTime: (wId: number): number => {
    return 0;
  },

  /**
   * 해당 근무자의 연장 근로 시간을 가져옵니다.
   * @param wId 근무자 ID
   * @returns 연장 근로 시간
   */
  getAdditionalWorkingTime: (wId: number): number => {
    return 0;
  },

  /**
   * 근무자가 근무하는 요일을 모두 가져옵니다.
   * @param wId 근무자 ID
   */
  getWorkWeekdays: (wId: number): WeekDays[] => {
    let res: string[] = [];
    for (const [wd, day] of Object.entries(currentShiftData.week.days)) {
      const x = Object.keys(day.workers).filter((w) => parseInt(w) === wId);
      if (x.length > 0) res = [...res, wd];
    }

    return res as WeekDays[];
  },

  /**
   * 해당 근무자의 직급에 대한 그라이언트 색상 정보를 가져옵니다.
   * @param w 근무자 정보
   * @returns 근무자의 직급에 대한 그라이언트 색상 정보
   */
  getRoleColorGradient: (w: Worker): string => {
    const roleData = ShiftF.getRoleData(w);
    const c1 = roleData.displayColor1;
    const c2 = roleData.displayColor2 ?? roleData.displayColor1;
    return `linear-gradient(90deg, ${c1} 0%, ${c1} 40%, ${c2} 70%, ${c2} 100%)`;
  },

  /**
   * 해당 요일-시간에 해당 하는 근무자의 인원수를 가져옵니다.
   * @param wd 요일
   * @param h 시간
   * @returns 해당 시간의 근무자 인원수
   */
  getWorkerCount: (wd: WeekDays, h: number): number => {
    const day = currentShiftData.week.days[wd];
    const workers = Object.values(day.workers).filter(
      (pt) => pt.start <= h && pt.end > h
    );
    return workers.length;
  },
};

export let currentShiftData: Shift = TestShiftData;

export const onModifiedShiftData = new CustomEvent("onModifiedShiftData");
export const modifyShiftData = () => {
  window.dispatchEvent(onModifiedShiftData);
};
