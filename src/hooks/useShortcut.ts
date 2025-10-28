import { useEffect } from "react";

const useShortcut = (keys: string[], callback: () => void) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const keySet = new Set(keys.map((k) => k.toLowerCase()));
      const pressed = new Set();

      if (e.ctrlKey) pressed.add("ctrl");
      if (e.metaKey) pressed.add("meta"); // macOS용
      if (e.shiftKey) pressed.add("shift");
      if (e.altKey) pressed.add("alt");
      if (e.key) pressed.add(e.key.toLowerCase());

      const match = [...keySet].every((k) => pressed.has(k));
      if (match) {
        e.preventDefault(); // 기본 동작 방지 (예: 브라우저 저장창)
        callback();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [keys, callback]);
};

export default useShortcut;
