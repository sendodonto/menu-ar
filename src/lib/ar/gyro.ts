import * as THREE from 'three';
import { createOrientationFilter } from './orientation-filter';
import { coverVideo, createStage, loadDish } from './stage';

// shortcut: typical phone main-camera field of view along the long side; real devices vary ±10%, so scale is approximate.
const LONG_SIDE_FOV_DEG = 66;
// shortcut: assumed height of the phone above the table when seated; the dish's real size depends on it.
const TABLE_DROP_M = 0.4;

type OrientationSensorLike = EventTarget & { quaternion?: number[]; start(): void; stop(): void };
type SensorCtor = new (opts: { frequency: number; referenceFrame: 'screen' | 'device' }) => OrientationSensorLike;

/** iOS 13+ asks for motion permission; it must be called from a tap. */
export async function requestMotionPermission() {
  const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<'granted' | 'denied'> };
  if (typeof DOE?.requestPermission === 'function' && (await DOE.requestPermission()) !== 'granted')
    throw new Error('Permita o acesso ao movimento do aparelho para ver o prato na mesa.');
}

// Sensor frames are Z-up; three.js is Y-up.
const Z_UP_TO_Y_UP = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);

/**
 * Orientation source. Prefers the gyroscope-only RelativeOrientationSensor (Chrome Android: no compass, so no yaw
 * jumps) and falls back to deviceorientation (Safari). Writes the latest camera rotation into `target`.
 */
function watchOrientation(target: THREE.Quaternion, onFirst: () => void, onNoGyro: () => void) {
  let first = true;
  const got = () => { if (first) { first = false; onFirst(); } };
  const Ctor = (window as unknown as { RelativeOrientationSensor?: SensorCtor }).RelativeOrientationSensor;
  if (Ctor) {
    try {
      const sensor = new Ctor({ frequency: 60, referenceFrame: 'screen' });
      const q = new THREE.Quaternion();
      sensor.addEventListener('reading', () => {
        if (!sensor.quaternion) return;
        q.fromArray(sensor.quaternion);
        target.copy(Z_UP_TO_Y_UP).multiply(q);
        got();
      });
      sensor.addEventListener('error', () => { sensor.stop(); fallback(); });
      sensor.start();
      let stopFallback = () => {};
      function fallback() { onNoGyro(); stopFallback = watchDeviceOrientation(target, got); }
      return () => { sensor.stop(); stopFallback(); };
    } catch {
      // Blocked by permissions policy or unsupported options: use deviceorientation instead.
    }
  }
  if (!Ctor) onNoGyro();
  return watchDeviceOrientation(target, got);
}

function watchDeviceOrientation(target: THREE.Quaternion, got: () => void) {
  const r = THREE.MathUtils.degToRad;
  const euler = new THREE.Euler();
  const flip = new THREE.Quaternion(-Math.SQRT1_2, 0, 0, Math.SQRT1_2);
  const screenQ = new THREE.Quaternion();
  const z = new THREE.Vector3(0, 0, 1);
  const on = (e: DeviceOrientationEvent) => {
    if (e.alpha == null || e.beta == null || e.gamma == null) return;
    euler.set(r(e.beta), r(e.alpha), -r(e.gamma), 'YXZ');
    target.setFromEuler(euler).multiply(flip).multiply(screenQ.setFromAxisAngle(z, -r(screen.orientation?.angle ?? 0)));
    got();
  };
  window.addEventListener('deviceorientation', on);
  return () => window.removeEventListener('deviceorientation', on);
}

/**
 * "On my table" without any AR runtime, Pokémon-style: the rear camera is the background, the phone's rotation
 * turns the virtual camera, and the dish rests on an assumed table plane where the user aims or drags it.
 */
export async function startGyroAR(container: HTMLElement, video: HTMLVideoElement, modelUrl: string, events: { onSensor: (ok: boolean) => void; onPlaced: (ok: boolean) => void; onDragged: () => void }) {
  const dish = await loadDish(modelUrl);
  const stage = createStage(container);
  const { scene, camera, renderer, sun } = stage;
  // holder: where the dish sits on the table, facing the guest. tilt/spin: the guest's turntable gesture.
  const holder = new THREE.Group();
  const tiltG = new THREE.Group();
  const spinG = new THREE.Group();
  spinG.add(dish.group);
  tiltG.add(spinG);
  holder.add(tiltG);
  holder.visible = false;
  scene.add(holder);
  sun.position.set(0.4, 1.5, 0.6);

  const layout = () => {
    const s = coverVideo(video, container);
    stage.resize();
    const f = Math.max(video.videoWidth, video.videoHeight) / 2 / Math.tan(THREE.MathUtils.degToRad(LONG_SIDE_FOV_DEG / 2));
    camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(container.clientHeight / 2 / (f * s)));
    camera.updateProjectionMatrix();
  };
  layout();
  window.addEventListener('resize', layout);

  // Ray from the camera through a screen point onto the table plane (y = -TABLE_DROP_M).
  const ray = new THREE.Raycaster();
  const table = new THREE.Plane(new THREE.Vector3(0, 1, 0), TABLE_DROP_M);
  const hit = new THREE.Vector3();
  const tableAt = (ndcX: number, ndcY: number) => {
    ray.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
    if (ray.ray.direction.y > -0.1) return null; // aiming at the horizon or above: no table there
    return ray.ray.intersectPlane(table, hit) ? hit.clone() : null;
  };
  const putAt = (p: THREE.Vector3) => {
    holder.position.copy(p);
    holder.rotation.y = Math.atan2(-p.x, -p.z); // local +Z points back at the guest (camera at the origin)
    holder.visible = true;
  };

  const target = new THREE.Quaternion();
  const filter = createOrientationFilter();
  let ready = false;
  let placed = false;
  const stopOrientation = watchOrientation(
    target,
    () => { camera.quaternion.copy(target); ready = true; events.onSensor(true); },
    // shortcut: without the gyro-only sensor the browser may derive orientation from accelerometer + compass, which
    // shakes; filter harder there. Upgrade path: a real AR runtime (ARCore/ARKit) where the device has one.
    () => filter.tune({ minCutoff: 0.35, beta: 1.2, deadZoneDeg: 0.45 }),
  );
  const noSensor = setTimeout(() => { if (!ready) events.onSensor(false); }, 2500);

  // Just above screen centre, so the whole dish lands clear of the bottom controls.
  const aim = () => {
    const p = tableAt(0, 0.05);
    if (p) { putAt(p); placed = true; events.onPlaced(true); }
    return !!p;
  };
  const place = () => aim() || (events.onPlaced(false), false);

  // Turntable gesture (Apple-style direct manipulation): sideways drag spins the dish 1:1 and keeps spinning with the
  // finger's momentum after release; vertical drag tips the dish toward the guest to see it from above.
  const SPIN_PER_PX = 0.012;
  const TILT_PER_PX = 0.008;
  const MAX_TILT = 0.9; // rad, ~50°: with the phone already looking down, that is close to a top view
  const MAX_SPIN_SPEED = 12; // rad/s, about two turns per second
  let spin = 0;
  let spinVelocity = 0; // rad/s
  let tilt = 0;
  let pointer: { id: number; x: number; y: number; history: { t: number; x: number }[] } | null = null;
  const canvas = renderer.domElement;
  canvas.style.touchAction = 'none';
  const down = (e: PointerEvent) => {
    if (pointer || !placed) return;
    canvas.setPointerCapture(e.pointerId);
    pointer = { id: e.pointerId, x: e.clientX, y: e.clientY, history: [{ t: e.timeStamp, x: e.clientX }] };
    spinVelocity = 0; // grabbing stops the spin, like a real turntable
  };
  const move = (e: PointerEvent) => {
    if (!pointer || e.pointerId !== pointer.id) return;
    spin += (e.clientX - pointer.x) * SPIN_PER_PX;
    tilt = THREE.MathUtils.clamp(tilt - (e.clientY - pointer.y) * TILT_PER_PX, 0, MAX_TILT);
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.history = [...pointer.history.slice(-4), { t: e.timeStamp, x: e.clientX }];
  };
  const up = (e: PointerEvent) => {
    if (!pointer || e.pointerId !== pointer.id) return;
    const h = pointer.history;
    const first = h[0], last = h[h.length - 1];
    const dt = (last.t - first.t) / 1000;
    if (dt > 0.01 && e.timeStamp - last.t < 80) spinVelocity = THREE.MathUtils.clamp(((last.x - first.x) * SPIN_PER_PX) / dt, -MAX_SPIN_SPEED, MAX_SPIN_SPEED);
    pointer = null;
    events.onDragged();
  };
  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);

  let last = performance.now();
  renderer.setAnimationLoop((now: number) => {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (ready) {
      filter.step(camera.quaternion, target, dt);
      if (!placed) aim(); // appear as soon as the phone points at the table
    }
    if (!pointer && Math.abs(spinVelocity) > 0.01) {
      spin += spinVelocity * dt;
      spinVelocity *= Math.pow(0.998, dt * 1000); // same deceleration as iOS scrolling
    }
    spinG.rotation.y = spin;
    tiltG.rotation.x = tilt; // pivots on the plate's centre so its distance (and apparent size) stays put
    renderer.render(scene, camera);
  });

  return {
    place,
    setDishVisible: (v: boolean) => { holder.visible = v && placed; },
    stop() {
      clearTimeout(noSensor);
      stopOrientation();
      window.removeEventListener('resize', layout);
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
      stage.dispose();
    },
  };
}
