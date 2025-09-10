export type OperationSymbol =
  | "==="
  | "!=="
  | "=="
  | "!="
  | "<"
  | "<="
  | ">"
  | ">=";

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
   * @param original 포맷팅할 원본
   * @param formatSet 포맷팅 설정 (key: 필터링될 문자열, value: 반환할 문자열 getter)
   */
  formater: (
    original: string,
    formatSet: { [filter: string]: () => string }
  ): string => {
    let result: string = original;
    Object.keys(formatSet).forEach((key) => {
      result = result.replace(key, formatSet[key]());
    });

    return result;
  },
};

export default util;
