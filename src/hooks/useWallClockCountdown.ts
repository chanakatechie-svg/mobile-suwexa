import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

interface Options {
  /** Duration in seconds, counted from the moment `active` flips to true. */
  seconds: number;
  /** Countdown runs only while true; flipping false→true restarts it. */
  active: boolean;
  /** Fired once per activation when the deadline passes. */
  onExpire?: () => void;
}

/**
 * Countdown driven by an absolute wall-clock deadline.
 *
 * The web version (frontend-suwexa/.../login/index.tsx useCountdown)
 * decrements on setInterval. That silently breaks on mobile: iOS suspends JS
 * timers when backgrounded, Android throttles them under Doze, and device
 * sleep stops them entirely — so a 5-minute OTP countdown can still read 4:30
 * after 3 real minutes, the expiry guard never fires, and the user instead
 * hits an unexplained server 401.
 *
 * Here `remaining` is always DERIVED from a stored deadline, and recomputed on
 * three triggers: the 1s interval (just a repaint prompt — its accuracy no
 * longer matters), an AppState "active" listener (what makes backgrounding
 * correct), and activation itself.
 *
 * Returns the same { remaining, formatted } shape as the web hook so ported
 * JSX (t.expiresIn(otpFmt), t.selectWithin(...), t.completeIn(...)) is unchanged.
 */
export function useWallClockCountdown({ seconds, active, onExpire }: Options) {
  const [remaining, setRemaining] = useState(seconds);

  const deadlineRef = useRef<number | null>(null);
  const firedRef = useRef(false);
  // Kept in a ref so an inline closure doesn't land in an effect dep array and
  // restart the deadline on every render.
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const recompute = useCallback(() => {
    if (deadlineRef.current === null) return;
    const left = Math.max(
      0,
      Math.ceil((deadlineRef.current - Date.now()) / 1000),
    );
    setRemaining(left);
    // Guard so the interval and the AppState handler can't both fire onExpire
    // when they cross zero in the same frame (two resetToPhone()s, two toasts).
    if (left === 0 && !firedRef.current) {
      firedRef.current = true;
      onExpireRef.current?.();
    }
  }, []);

  useEffect(() => {
    if (!active) {
      deadlineRef.current = null;
      firedRef.current = false;
      setRemaining(seconds);
      return;
    }

    // Set the deadline only on the false→true edge.
    deadlineRef.current = Date.now() + seconds * 1000;
    firedRef.current = false;
    setRemaining(seconds);

    const id = setInterval(() => {
      recompute();
      if (deadlineRef.current !== null && Date.now() >= deadlineRef.current) {
        clearInterval(id); // stop repainting an expired screen
      }
    }, 1000);

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") recompute();
    });

    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [active, seconds, recompute]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  return { remaining, formatted: `${mm}:${ss}` };
}
