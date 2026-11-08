import * as THREE from 'three';
import { coverVideo, createStage, loadDish } from './stage';

// shortcut: typical phone main-camera field of view along the long side; real devices vary ±10%, so scale is approximate.
const LONG_SIDE_FOV_DEG = 66;
// shortcut: assumed height of the phone above the table when seated; the dish's real size depends on it.
const TABLE_DROP_M = 0.4;
// Fraction of the remaining rotation applied per frame: filters sensor jitter without feeling laggy.
const SMOOTHING = 0.35;

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
function watchOrientation(target: THREE.Quaternion, onFirst: () => void) {
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
      function fallback() { stopFallback = watchDeviceOrientation(target, got); }
      return () => { sensor.stop(); stopFallback(); };
    } catch {
      // Blocked by permissions policy or unsupported options: use deviceorientation instead.
    }
  }
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
  dish.group.visible = false;
  scene.add(dish.group);
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
    dish.group.position.copy(p);
    dish.group.rotation.y = Math.atan2(p.x, p.z) + Math.PI; // front of the dish faces the guest
    dish.group.visible = true;
  };

  const target = new THREE.Quaternion();
  let ready = false;
  let placed = false;
  const stopOrientation = watchOrientation(target, () => {
    camera.quaternion.copy(target);
    ready = true;
    events.onSensor(true);
  });
  const noSensor = setTimeout(() => { if (!ready) events.onSensor(false); }, 2500);

  // Just above screen centre, so the whole dish lands clear of the bottom controls.
  const aim = () => {
    const p = tableAt(0, 0.05);
    if (p) { putAt(p); placed = true; events.onPlaced(true); }
    return !!p;
  };
  const place = () => aim() || (events.onPlaced(false), false);

  // Drag with one finger: the dish follows the finger across the table (direct manipulation, 1:1).
  const canvas = renderer.domElement;
  canvas.style.touchAction = 'none';
  let dragging = false;
  const toNdc = (e: PointerEvent) => {
    const b = canvas.getBoundingClientRect();
    return [((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1] as const;
  };
  const down = (e: PointerEvent) => { dragging = true; canvas.setPointerCapture(e.pointerId); move(e); };
  const move = (e: PointerEvent) => {
    if (!dragging) return;
    const p = tableAt(...toNdc(e));
    if (p) { putAt(p); if (!placed) { placed = true; events.onPlaced(true); } }
  };
  const up = () => { if (dragging && placed) events.onDragged(); dragging = false; };
  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);

  renderer.setAnimationLoop(() => {
    if (ready) {
      camera.quaternion.slerp(target, SMOOTHING);
      if (!placed) aim(); // appear as soon as the phone points at the table
    }
    renderer.render(scene, camera);
  });

  return {
    place,
    setDishVisible: (v: boolean) => { dish.group.visible = v && placed; },
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
