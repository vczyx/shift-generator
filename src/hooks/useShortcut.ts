import { useEffect } from "react";

const useShortcut = (
  keys: string[],
  callback: () => void,
  deps: React.DependencyList = []
) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const required = new Set(keys.map((k) => k.toLowerCase()));
      const pressed = new Set<string>();

      if (e.ctrlKey) pressed.add("ctrl");
      if (e.metaKey) pressed.add("meta");
      if (e.shiftKey) pressed.add("shift");
      if (e.altKey) pressed.add("alt");

      const key = e.key.toLowerCase();
      if (!["control", "meta", "shift", "alt"].includes(key)) {
        pressed.add(key);
      }

      const match =
        required.size === pressed.size &&
        [...required].every((k) => pressed.has(k));

      if (match) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [keys.join(","), callback, ...deps]);
};

export default useShortcut;
