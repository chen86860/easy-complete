import { useState, useEffect, useMemo, useCallback } from "react";

import { useResizeObserver } from "use-resize-observer";

type Dimensions = {
  height?: number;
  width?: number;
};

// Callers only care about the size, not the `ResizeObserverEntry` that
// use-resize-observer hands to its own `onResize`.
type DynamicResizeObserverOpts<T extends Element> = Omit<
  NonNullable<Parameters<typeof useResizeObserver<T>>[0]>,
  "onResize"
> & {
  onResize?: (size: Dimensions) => void;
};

// Like resizeObserver but re-calls onResize callback when onResize changes.
export const useDynamicResizeObserver = <T extends Element>(
  opts?: DynamicResizeObserverOpts<T>,
) => {
  const { onResize, ...otherOpts } = opts || {};
  const [{ height, width }, setDimensions] = useState<Dimensions>({
    height: 0,
    width: 0,
  });

  const { ref } = useResizeObserver<T>({
    ...otherOpts,
    onResize: ({ height: nextHeight, width: nextWidth }) =>
      setDimensions({ height: nextHeight, width: nextWidth }),
  });

  useEffect(() => {
    if (onResize) {
      onResize({ height, width });
    }
  }, [height, width, onResize]);

  return useMemo(() => ({ height, width, ref }), [height, width, ref]);
};

export const useShake = (): [boolean, () => void] => {
  const [isShaking, setShaking] = useState(false);
  const shake = useCallback((ms = 200) => {
    setShaking(true);
    setTimeout(() => {
      setShaking(false);
    }, ms);
  }, []);
  return [isShaking, shake];
};

export type SystemTheme = "light" | "dark";

export const useSystemTheme = (): [SystemTheme] => {
  const getSystemTheme = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  const [systemTheme, setSystemTheme] = useState<SystemTheme>(getSystemTheme());
  useEffect(() => {
    const listener = (e: MediaQueryListEvent) =>
      setSystemTheme(e.matches ? "dark" : "light");
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    if (query.addEventListener) {
      query.addEventListener("change", listener);
    } else {
      query.addListener(listener);
    }
    return () =>
      query.removeEventListener
        ? query.removeEventListener("change", listener)
        : query.removeListener(listener);
  }, []);
  return [systemTheme];
};
