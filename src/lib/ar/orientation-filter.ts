import { MathUtils, Quaternion } from 'three';

const lowpassAlpha = (cutoffHz: number, dt: number) => 1 / (1 + 1 / (2 * Math.PI * cutoffHz * dt));

/**
 * One Euro filter for orientation: heavy smoothing while the phone is (nearly) still, light smoothing while it turns,
 * so hand/sensor tremor disappears without the dish lagging behind real movement. Changes below `deadZoneDeg`
 * are ignored outright.
 */
export function createOrientationFilter({ minCutoff = 0.6, beta = 1.8, dCutoff = 1, deadZoneDeg = 0.25 } = {}) {
  // Speed is measured on a pre-smoothed copy: frame-to-frame noise would otherwise read as fast motion.
  const pre = new Quaternion();
  const prevPre = new Quaternion();
  let speed = 0;
  let started = false;
  return {
    /** Moves `current` toward `raw`; dt in seconds. */
    step(current: Quaternion, raw: Quaternion, dt: number) {
      if (!started) { current.copy(raw); pre.copy(raw); prevPre.copy(raw); started = true; return; }
      dt = Math.min(Math.max(dt, 1 / 240), 0.1);
      pre.slerp(raw, lowpassAlpha(4, dt));
      const rawSpeed = prevPre.angleTo(pre) / dt; // rad/s
      prevPre.copy(pre);
      speed += lowpassAlpha(dCutoff, dt) * (rawSpeed - speed);
      if (current.angleTo(raw) < MathUtils.degToRad(deadZoneDeg)) return;
      current.slerp(raw, lowpassAlpha(minCutoff + beta * speed, dt));
    },
    tune(opts: { minCutoff?: number; beta?: number; deadZoneDeg?: number }) {
      ({ minCutoff = minCutoff, beta = beta, deadZoneDeg = deadZoneDeg } = opts);
    },
  };
}
