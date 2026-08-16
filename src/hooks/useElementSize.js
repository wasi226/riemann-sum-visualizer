import { useEffect, useRef, useState } from "react";

/**
 * Observes an element's content-box size using ResizeObserver.
 * Returns a ref to attach and the current size. Falls back to a
 * measured size on mount so the first paint isn't 0×0.
 */
export function useElementSize() {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () =>
      setSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, size];
}
