import util from "../utils/util";
import { currentConfig } from "./Config";
/**
 * 근무 파트를 지정하는 인터페이스.
 */
export interface PartTime {
  start: number;
  end: number;
}

/**
 * PartTime의 휴게 시간을 가져옵니다.
 * @param pt 근무 파트
 * @returns 해당 근무 파트의 휴게 시간
 */
export function getRestTime(pt: PartTime): number {
  let time = getTotalTime(pt);
  let restTimeTotal = 0;

  // 휴게 시간 계산
  for (let i = 0; i < currentConfig.Restaurant.restTime.length; i++) {
    const rtCfg = currentConfig.Restaurant.restTime[i];

    // RestTime Config 중 조건에 맞는지 확인
    if (util.stropIf(time, rtCfg.operator, rtCfg.condition)) {
      // 다음 휴게 시간을 계산하기 위해서 총 시간에서 휴게 시간을 차감
      time -= rtCfg.restTime;
      restTimeTotal += rtCfg.restTime;
    }
  }

  // 계산된 휴게 시간이 0이면 경고 출력
  if (restTimeTotal === 0) {
    console.warn(
      `Couldn't calculate the rest time(${getTotalTime(pt)}). Please check the rest time configuration.`
    );
  }

  return restTimeTotal;
}

/**
 * PartTime의 실근무 시간을 가져옵니다.
 * @param pt 근무 파트
 * @returns 해당 근무 파트의 실근무 시간
 */
export function getWorkTime(pt: PartTime): number {
  return getTotalTime(pt) - getRestTime(pt);
}

/**
 * PartTime의 총 시간을 가져옵니다.
 * @param pt 근무 파트
 * @returns 해당 근무 파트의 총 시간
 */
export function getTotalTime(pt: PartTime): number {
  return pt.end - pt.start;
}

/**
 * PartTime이 해당 시간에 근무 중인지에 대한 여부를 가져옵니다.
 * @param pt 근무 파트
 * @param hour 시간
 * @returns 해당 시간에 근무 중인지에 대한 여부
 */
export function isWorking(pt: PartTime, hour: number) {
  return hour >= pt.start && hour <= pt.end;
}
