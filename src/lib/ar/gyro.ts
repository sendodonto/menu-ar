import * as THREE from 'three';
import { coverVideo, createStage, loadDish } from './stage';

// shortcut: typical phone main-camera field of view along the long side; real devices vary ±10%, so scale is approximate in this mode.
const LONG_SIDE_FOV_DEG = 66;

/** Device orientation (degrees) to camera quaternion, Y up, as three's former DeviceOrientationControls did. */
function orientationQuaternion(q: THREE.Quaternion, alpha: number, beta: number, gamma: number, screen: number) {
  const r = THREE.MathUtils.degToRad;
  q.setFromEuler(new THREE.Euler(r(beta), r(alpha), -r(gamma), 'YXZ'));
  q.multiply(new THREE.Quaternion(-Math.SQRT1_2, 0, 0, Math.SQRT1_2));
  q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -r(screen)));
}

/** iOS 13+ asks for motion permission; it must be called from a tap. */
export async function requestMotionPermission() {
  const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<'granted' | 'denied'> };
  if (typeof DOE?.requestPermission === 'function' && (await DOE.requestPermission()) !== 'granted')
    throw new Error('Permita o acesso ao movimento do aparelho para posicionar o prato.');
}

/**
 * Approximate AR without any AR runtime: the rear camera is the background and the phone's gyroscope turns the
 * virtual camera, so a dish placed on an assumed table plane stays put while the phone rotates (3 degrees of freedom).
 */
export async function startGyroAR(container: HTMLElement, video: HTMLVideoElement, modelUrl: string, opts: { onSensor: (ok: boolean) => void }) {
  const dish = await loadDish(modelUrl);
  const stage = createStage(container);
  const { scene, camera, renderer, sun } = stage;
  dish.group.visible = false;
  scene.add(dish.group);
  sun.position.set(0.4, 1.5, 0.6);

  let tableDrop = 0.4; // camera height above the table, meters
  let gotSensor = false;

  const layout = () => {
    const s = coverVideo(video, container);
    stage.resize();
    const f = Math.max(video.videoWidth, video.videoHeight) / 2 / Math.tan(THREE.MathUtils.degToRad(LONG_SIDE_FOV_DEG / 2));
    camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(container.clientHeight / 2 / (f * s)));
    camera.updateProjectionMatrix();
  };
  layout();
  window.addEventListener('resize', layout);

  const onOrient = (e: DeviceOrientationEvent) => {
    if (e.alpha == null || e.beta == null || e.gamma == null) return;
    if (!gotSensor) { gotSensor = true; opts.onSensor(true); }
    orientationQuaternion(camera.quaternion, e.alpha, e.beta, e.gamma, screen.orientation?.angle ?? 0);
  };
  window.addEventListener('deviceorientation', onOrient);
  const noSensor = setTimeout(() => { if (!gotSensor) opts.onSensor(false); }, 2500);

  renderer.setAnimationLoop(() => renderer.render(scene, camera));

  const place = () => {
    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    if (dir.y > -0.12) return false; // looking at the horizon or up: no table there
    const t = -tableDrop / dir.y;
    const at = dir.multiplyScalar(t);
    dish.group.position.set(at.x, -tableDrop, at.z);
    dish.group.rotation.y = Math.atan2(at.x, at.z) + Math.PI;
    dish.group.visible = true;
    return true;
  };

  return {
    place,
    setDishVisible: (v: boolean) => { dish.group.visible = v; },
    // Same viewing ray, new table height: the dish slides along the ray, keeping where it appears on screen.
    setTableDrop: (m: number) => {
      dish.group.position.multiplyScalar(m / tableDrop);
      tableDrop = m;
    },
    stop() {
      clearTimeout(noSensor);
      window.removeEventListener('resize', layout);
      window.removeEventListener('deviceorientation', onOrient);
      stage.dispose();
    },
  };
}
