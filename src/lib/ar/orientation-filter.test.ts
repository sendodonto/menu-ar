import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Euler, MathUtils, Quaternion } from 'three';
import { createOrientationFilter } from './orientation-filter.ts';

const q = (yawDeg: number, pitchDeg = -40) => new Quaternion().setFromEuler(new Euler(MathUtils.degToRad(pitchDeg), MathUtils.degToRad(yawDeg), 0, 'YXZ'));
const deg = (a: Quaternion, b: Quaternion) => MathUtils.radToDeg(a.angleTo(b));
// Seeded noise so the test is deterministic.
let seed = 12345;
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);

test('tremor of ±1.5° at rest is reduced to a small wobble', () => {
  const f = createOrientationFilter();
  const out = q(0); const rest = q(0);
  let worst = 0;
  for (let i = 0; i < 600; i++) {
    const noisy = q((rand() - 0.5) * 3, -40 + (rand() - 0.5) * 3);
    f.step(out, noisy, 1 / 60);
    if (i > 60) worst = Math.max(worst, deg(out, rest));
  }
  assert.ok(worst < 1, `output wobble ${worst.toFixed(2)}° should stay well under the 1.5° input noise`);
});

test('a real 45° turn is followed without lingering lag', () => {
  const f = createOrientationFilter();
  const out = q(0);
  f.step(out, q(0), 1 / 60);
  for (let i = 0; i < 30; i++) f.step(out, q(45 * (i + 1) / 30), 1 / 60); // 45° in 0.5 s
  for (let i = 0; i < 20; i++) f.step(out, q(45), 1 / 60); // then hold for 1/3 s
  assert.ok(deg(out, q(45)) < 2, `still ${deg(out, q(45)).toFixed(2)}° behind`);
});

test('the harder no-gyro tuning still follows a real turn', () => {
  const f = createOrientationFilter();
  f.tune({ minCutoff: 0.35, beta: 1.2, deadZoneDeg: 0.45 });
  const out = q(0);
  f.step(out, q(0), 1 / 60);
  for (let i = 0; i < 30; i++) f.step(out, q(45 * (i + 1) / 30), 1 / 60);
  for (let i = 0; i < 30; i++) f.step(out, q(45), 1 / 60);
  assert.ok(deg(out, q(45)) < 3, `still ${deg(out, q(45)).toFixed(2)}° behind`);
});
