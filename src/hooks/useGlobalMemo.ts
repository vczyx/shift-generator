import { useRef, ComponentType } from "react";
import { areDepsEqual } from "../utils/util";

const globalMemoMap = new WeakMap<ComponentType<any>, Map<string, any>>();

const useGlobalMemo = <T>(
  component: ComponentType<any>,
  key: string,
  factory: () => T,
  deps: any[]
): T => {
  if (!globalMemoMap.has(component)) {
    globalMemoMap.set(component, new Map());
  }
  const memoMap = globalMemoMap.get(component)!;

  // deps 추적용 ref
  const depsRef = useRef<any[] | undefined>(undefined);

  if (!memoMap.has(key) || !areDepsEqual(depsRef.current, deps)) {
    const value = factory();
    memoMap.set(key, value);
    depsRef.current = deps;
  }

  return memoMap.get(key);
};
export default useGlobalMemo;
