import { useEffect, useState, type ReactNode } from "react";
import { InteractionManager } from "react-native";

type LazyMountProps = {
  children: ReactNode;
  /** Atraso extra após interações iniciais (ms). */
  delayMs?: number;
  placeholder?: ReactNode;
};

export function LazyMount({
  children,
  delayMs = 0,
  placeholder = null,
}: LazyMountProps) {
  const [mounted, setMounted] = useState(delayMs === 0);

  useEffect(() => {
    if (delayMs === 0) {
      setMounted(true);
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const task = InteractionManager.runAfterInteractions(() => {
      timeoutId = setTimeout(() => setMounted(true), delayMs);
    });

    return () => {
      task.cancel();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [delayMs]);

  if (!mounted) return placeholder;
  return children;
}
