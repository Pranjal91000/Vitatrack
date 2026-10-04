import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useActiveWorkout } from '@/store/activeWorkoutStore';
import { useSettings } from '@/store/settingsStore';
import { vibrate } from '@/lib/utils';

function useNow(intervalMs: number, enabled = true) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled]);
  return now;
}

/** Seconds since the workout started. */
export function useElapsed(startedAt?: string) {
  const now = useNow(1000, !!startedAt);
  return startedAt ? Math.max(0, (now - new Date(startedAt).getTime()) / 1000) : 0;
}

/** Seconds left on the rest timer, or null when no timer is running. */
export function useRestRemaining() {
  const rest = useActiveWorkout((s) => s.rest);
  const now = useNow(250, !!rest);
  return rest ? Math.max(0, Math.ceil((rest.endsAt - now) / 1000)) : null;
}

let audioCtx: AudioContext | null = null;
function beep() {
  try {
    audioCtx ??= new AudioContext();
    const t = audioCtx.currentTime;
    [0, 0.22, 0.44].forEach((offset, i) => {
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();
      osc.frequency.value = i === 2 ? 1175 : 880;
      gain.gain.setValueAtTime(0.0001, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.25, t + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + offset + 0.18);
      osc.connect(gain).connect(audioCtx!.destination);
      osc.start(t + offset);
      osc.stop(t + offset + 0.2);
    });
  } catch { /* audio blocked */ }
}

/** Call once near the app root: buzzes/beeps when rest is over, wherever the user is. */
export function useRestAlarm() {
  const rest = useActiveWorkout((s) => s.rest);
  const stopRest = useActiveWorkout((s) => s.stopRest);
  const sound = useSettings((s) => s.restSound);
  const fired = useRef<number | null>(null);

  useEffect(() => {
    if (!rest) return;
    const ms = rest.endsAt - Date.now();
    const fire = () => {
      if (fired.current === rest.endsAt) return;
      fired.current = rest.endsAt;
      vibrate([200, 100, 200, 100, 300]);
      if (sound) beep();
      toast('Rest over', { description: `Next set: ${rest.label}`, duration: 4000 });
      stopRest();
    };
    if (ms <= 0) { fire(); return; }
    const id = setTimeout(fire, ms);
    return () => clearTimeout(id);
  }, [rest, sound, stopRest]);
}

/** Keep the phone screen on while logging (where supported). */
export function useWakeLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !('wakeLock' in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    const request = async () => {
      try { lock = await navigator.wakeLock.request('screen'); } catch { /* denied or hidden */ }
    };
    const onVisible = () => { if (document.visibilityState === 'visible') request(); };
    request();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      lock?.release().catch(() => {});
    };
  }, [enabled]);
}

/** Unlock Web Audio on the first tap (iOS requires a user gesture). */
export function primeAudio() {
  try {
    audioCtx ??= new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  } catch { /* ignore */ }
}
