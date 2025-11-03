import { getDate, getMonth, getYear } from "date-fns";

export type OperationSymbol =
  | "==="
  | "!=="
  | "=="
  | "!="
  | "<"
  | "<="
  | ">"
  | ">=";

/**
 * 유틸리티 함수들을 제공합니다.
 */
const util = {
  /**
   * 런타임 중 if 구문을 연산합니다.
   * @param chk1 피연산자1
   * @param opr 연산자
   * @param chk2 피연산자2
   * @returns 연산결과
   */
  stropIf: (chk1: any, opr: OperationSymbol, chk2: any): boolean => {
    switch (opr) {
      case ">":
        return chk1 > chk2;
      case ">=":
        return chk1 >= chk2;
      case "===":
        return chk1 === chk2;
      case "<":
        return chk1 < chk2;
      case "<=":
        return chk1 <= chk2;
      case "!==":
        return chk1 !== chk2;
      case "!=":
        return chk1 != chk2;
      case "==":
        return chk1 == chk2;
    }
  },

  /**
   * 특정 문자열을 포맷팅 하여 재반환 합니다.
   * @param format 포맷팅할 원본
   * @param filterSet 필터링 설정 (key: 필터링될 문자열, value: 반환할 문자열 getter)
   */
  formatFilterer: (
    format: string,
    filterSet: { [filter: string]: () => string }
  ): string => {
    let result: string = format;
    Object.keys(filterSet).forEach((key) => {
      result = result.replace(key, filterSet[key]());
    });

    return result;
  },

  parseYYYYMMDD: (dateStr: string): Date | null => {
    const match = dateStr.match(/^(\d{4})(\d{2})(\d{2})$/);
    if (!match) return null;

    const [, year, month, day] = match;
    return new Date(Number(year), Number(month) - 1, Number(day));
  },
  parseYYYYMMDDx: (
    dateStr: string
  ): { year: number; month: number; day: number } => {
    const match = dateStr.match(/^(\d{4})(\d{2})(\d{2})$/);
    if (!match) return null;

    const [, year, month, day] = match;
    return { year: Number(year), month: Number(month) - 1, day: Number(day) };
  },

  isValidDateYYYYMMDD: (dateStr: string): boolean => {
    const regex = /^(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/;
    if (!regex.test(dateStr)) return false;

    const { year, month, day } = util.parseYYYYMMDDx(dateStr);
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === getYear(date) &&
      date.getMonth() === getMonth(date) &&
      date.getDate() === getDate(date)
    );
  },
};

export const range = (
  start: number,
  end: number,
  step: number = 1
): number[] => {
  return Array.from(
    { length: Math.ceil((end - start) / step) },
    (_, i) => start + i * step
  );
};

export const days: WeekDays[] = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
];

export const weekDayKor: Record<WeekDays, string> = {
  mon: "월",
  tue: "화",
  wed: "수",
  thu: "목",
  fri: "금",
  sat: "토",
  sun: "일",
};

export const areDepsEqual = (prev?: any[], next?: any[]) => {
  if (!prev || !next) return false;
  if (prev.length !== next.length) return false;
  return prev.every((v, i) => Object.is(v, next[i]));
};

export default util;
