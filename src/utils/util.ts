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
};

export default util;
