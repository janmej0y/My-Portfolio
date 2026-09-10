"use client";

import { ReactNode, useEffect, useState } from "react";

/**
 * Mounts children once the browser is idle.
 *
 * Everything wrapped here is page chrome that is not visible at first paint -
 * the voice bot launcher, ambient background effects, the cursor layer. Loading
 * them eagerly put their evaluation cost on the critical path and inflated
 * blocking time; deferring to idle keeps them out of it without changing what
 * eventually renders.
 */
export default function DeferUntilIdle({
  children,
  /** Hard cap, so the content still mounts on browsers that stay busy. */
  timeout = 2600,
}: {
  children: ReactNode;
  timeout?: number;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let idleHandle = 0;
    let timeoutHandle = 0;

    const mount = () => setReady(true);

    const ric = (
      window as Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      }
    ).requestIdleCallback;

    if (typeof ric === "function") {
      idleHandle = ric(mount, { timeout });
    } else {
      // Safari has no requestIdleCallback; a timeout is close enough here.
      timeoutHandle = window.setTimeout(mount, 900);
    }

    return () => {
      const cancel = (
        window as Window & { cancelIdleCallback?: (handle: number) => void }
      ).cancelIdleCallback;
      if (idleHandle && typeof cancel === "function") cancel(idleHandle);
      if (timeoutHandle) window.clearTimeout(timeoutHandle);
    };
  }, [timeout]);

  return ready ? <>{children}</> : null;
}
