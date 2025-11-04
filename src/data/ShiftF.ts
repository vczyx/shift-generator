import {
  intervalToDuration,
  Duration,
  isAfter,
  differenceInDays,
} from "date-fns";
import PartTimeF from "./PartTimeF";
import util from "../utils/util";
import { TestShiftData } from "../test/TestData";
import { currentConfig } from "./Config";
import { CSSColor } from "../utils/type";

/**
 * Shift 데이터와 관련된 확장 함수들을 제공합니다.
 */
const ShiftF = {
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
  getWorkDuration: (
    w: WorkerInfo,
    format: string = "[yy]년 [mm]개월"
  ): string => {
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
  getHealthCertDaysLeft: (w: WorkerInfo): number => {
    // 현재 날짜 - 보건증 만기일
    return differenceInDays(w.healthCertExpiryDate, new Date());
  },

  /**
   * 해당 근무자의 직급에 대한 세부 정보를 가져옵니다.
   * @param w 근무자 인적 정보
   * @returns 직급에 해당하는 Restaurant의 RoleDetail 데이터
   */
  getRoleData: (s: ShiftInformation, w: WorkerInfo): RestaurantRoleConfig => {
    if (!w) return null;
    return s.brandConfig.roles[w.role].details[w.roleDetail];
  },

  /**
   * 근무자 Id에 해당하는 근무자 데이터를 가져옵니다.
   * @param wId 근무자 ID
   * @returns Worker Data
   */
  getWorker: (s: ShiftInformation, wId: number): WorkerInfo | null => {
    return wId === -1 ? null : s.shift.workers[wId];
  },

  /**
   * 해당 근무자의 주간 근무 시간을 가져옵니다.
   * @param wId 근무자 ID
   * @returns 주간 근무 시간
   */
  getTotalWorkingTime: (s: ShiftInformation, wId: number): number => {
    let total = 0;
    for (const day of Object.values(s.shift.week.days)) {
      for (const [workerId, partTime] of Object.entries(day.workers)) {
        if (parseInt(workerId) === wId)
          total += PartTimeF.getWorkTime(s, partTime);
      }
    }
    return total;
  },

  /**
   * 해당 요일의 계획 시간을 가져옵니다.
   * @param wd 요일
   */
  getWeekPlannedUsageTime: (s: ShiftInformation, wd: WeekDays): number => {
    let total = 0;
    for (const pt of Object.values(s.shift.week.days[wd].workers))
      total += PartTimeF.getWorkTime(s, pt);

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
  getWorkWeekdays: (s: ShiftInformation, wId: number): WeekDays[] => {
    let res: string[] = [];
    for (const [wd, day] of Object.entries(s.shift.week.days)) {
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
  getRoleColorGradient: (s: ShiftInformation, w: WorkerInfo): string => {
    if (!w) return null;
    const roleData = ShiftF.getRoleData(s, w);
    const c1 = roleData.displayColor1;
    const c2 = roleData.displayColor2 ?? roleData.displayColor1;
    return `linear-gradient(to right in oklch, ${c1} 0%, ${c1} 40%, ${c2} 70%, ${c2} 100%)`;
  },

  /**
   * 해당 요일-시간에 해당 하는 근무자의 인원수를 가져옵니다.
   * @param wd 요일
   * @param h 시간
   * @returns 해당 시간의 근무자 인원수
   */
  getWorkerCount: (s: ShiftInformation, wd: WeekDays, h: number): number => {
    const day = s.shift.week.days[wd];
    const workers = Object.values(day.workers).filter(
      (pt) => pt.start <= h && pt.end > h
    );
    return workers.length;
  },

  /**
   * 해당 요일에 해당하는 근무자의 실 근무 시간을 가져옵니다.
   * @param wd 요일
   * @param wId 근무자 ID
   * @returns 해당 요일 근무자의 근무 시간
   */
  getWorkingTime: (s: ShiftInformation, wd: WeekDays, wId: number): number => {
    const day = s.shift.week.days[wd];
    return PartTimeF.getWorkTime(s, day.workers[wId]);
  },

  /**
   * 해당 요일에 근무자를 추가합니다.
   * @param wd 요일
   * @param wId 근무자 ID
   */
  addWorker: (
    s: ShiftInformation,
    wd: WeekDays,
    wId: number,
    pt?: PartTime
  ): Shift => {
    const x = { ...s.shift };
    x.week.days[wd].workers = Object.fromEntries([
      ...Object.entries(x.week.days[wd].workers),
      [wId, pt ?? { start: 0, end: 0 }],
    ]);
    return x;
  },
};

// export let currentShiftData: Shift = TestShiftData;

// export const onModifiedShiftData = new CustomEvent("modifiedShiftData");
// export const modifyShiftData = () => {
//   window.dispatchEvent(onModifiedShiftData);
// };

// export const setShiftData = (s: Shift | ((prev: Shift) => Shift)) => {
//   if (typeof s === "function") {
//   } else {
//   }
// };
export default ShiftF;
