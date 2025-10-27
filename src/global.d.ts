declare module "*.ico" {
  const value: string;
  export default value;
}

interface GetDataInfoResponse {
  [brand: string]: {
    [area: string]: {
      [restaurant: string]: {
        [date: string]: string[];
      };
    };
  };
}

interface RestaurantRoleConfig {
  nickname: string;
  descriptions: string;
  displayColor1: CSSColor;
  displayColor2: CSSColor;
  maxUsageTime: number;
  limitUsageTime: number;
  maxWorkingTime: number;
}

interface IpcResponse<T> {
  success: boolean;
  error?: string;
  data?: T;
}

interface BrandConfig {
  /**
   * 직급 설정
   */
  roles: {
    [name: string]: {
      details: { [name: string]: RestaurantRoleConfig };
    };
  };
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
  operatingEnd: number;
}

interface RestTimeConfig {
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

interface PartTime {
  start: number;
  end: number;
}

/**
 * 근무 시간 종류
 */
type WorkTypes = "fixed" | "variable";

/**
 * 요일 종류
 */
type WeekDays = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

/**
 * 시간 (0-24)
 */
type Hour =
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
type TCList = Record<Hour, number>;

/**
 * 근무자 인적 사항
 */
interface WorkerInfo {
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

interface Day {
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

interface Week {
  /**
   * 요일 설정
   */
  days: Record<WeekDays, Day>;
}

interface Shift {
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
  workers: { [workerId: number]: WorkerInfo };
}

interface ShiftInformation {
  brandConfig: BrandConfig;
  shift: Shift;
}

interface DirectoryInfo {
  directories: { [dir: string]: DirectoryInfo };
  files: string[];
}

interface Address {
  brand: string;
  area: string;
  restaurant: string;
  date: string;
  shift: string;
}
