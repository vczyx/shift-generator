import { useRef, ComponentType } from "react";
import { areDepsEqual } from "../utils/util";

const globalCallbackMap = new WeakMap<ComponentType<any>, Map<string, any>>();

/**
 * useGlobalCallback
 */
export function useGlobalCallback<T extends (...args: any[]) => any>(
  component: ComponentType<any>,
  key: string,
  callback: T,
  deps: any[]
): T {
  if (!globalCallbackMap.has(component)) {
    globalCallbackMap.set(component, new Map());
  }
  const cbMap = globalCallbackMap.get(component)!;

  // deps 추적용 ref
  const depsRef = useRef<any[] | undefined>(undefined);

  if (!cbMap.has(key) || !areDepsEqual(depsRef.current, deps)) {
    cbMap.set(key, callback);
    depsRef.current = deps;
  }

  return cbMap.get(key);
}
