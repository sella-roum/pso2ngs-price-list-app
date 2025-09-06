import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile(defaultIsMobile = false) {
  const [isMobile, setIsMobile] = useState<boolean>(defaultIsMobile);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const onChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    // Safari < 14 向けのフォールバック
    if ("addEventListener" in mql) {
      mql.addEventListener("change", onChange);
    } else {
      (mql as any).addListener(onChange);
    }

    // 初期状態を設定
    setIsMobile(mql.matches);

    return () => {
      if ("removeEventListener" in mql) {
        mql.removeEventListener("change", onChange);
      } else {
        (mql as any).removeListener(onChange);
      }
    };
  }, []);

  return isMobile;
}
