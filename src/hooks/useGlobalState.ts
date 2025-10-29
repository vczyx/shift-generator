import {
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  ComponentType,
} from "react";

const globalStateMap = new WeakMap<ComponentType<any>, Map<string, any>>();
const subscribersMap = new WeakMap<
  ComponentType<any>,
  Map<string, Set<Dispatch<SetStateAction<any>>>>
>();

export function useGlobalState<T>(
  component: ComponentType<any>,
  key: string,
  initialValue?: T
): [T, Dispatch<SetStateAction<T>>] {
  // 상태 초기화
  const [state, setState] = useState<T>(() => {
    if (!globalStateMap.has(component)) {
      globalStateMap.set(component, new Map());
    }
    const stateMap = globalStateMap.get(component)!;
    if (stateMap.has(key)) {
      return stateMap.get(key);
    } else {
      stateMap.set(key, initialValue);
      return initialValue;
    }
  });

  // 구독자 등록
  useEffect(() => {
    if (!subscribersMap.has(component)) {
      subscribersMap.set(component, new Map());
    }
    const keyMap = subscribersMap.get(component)!;
    if (!keyMap.has(key)) {
      keyMap.set(key, new Set());
    }
    keyMap.get(key)!.add(setState);

    return () => {
      keyMap.get(key)?.delete(setState);
    };
  }, [component, key]);

  // 상태 변경 함수
  const dispatch: Dispatch<SetStateAction<T>> = (action) => {
    const stateMap = globalStateMap.get(component)!;
    const prev = stateMap.get(key);
    const next =
      typeof action === "function" ? (action as (prev: T) => T)(prev) : action;
    stateMap.set(key, next);

    // 구독자 알림
    const keyMap = subscribersMap.get(component)!;
    keyMap.get(key)?.forEach((fn) => fn(next));
    console.log(component, key, next);
  };

  return [state, dispatch];
}
