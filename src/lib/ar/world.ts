import * as THREE from 'three';
import { asset } from '@/lib/asset';
import { loadDish } from './stage';

// shortcut: 8th Wall's "responsive" scale treats the camera's start height as the distance to the surface it first
// looks at; seated guests hold the phone ~40 cm above the table, so 1 scene unit ≈ 1 m. Real devices drift ±20%.
const START_HEIGHT_M = 0.4;

type XR8Like = {
  addCameraPipelineModules: (m: unknown[]) => void;
  clearCameraPipelineModules: () => void;
  run: (o: { canvas: HTMLCanvasElement; allowedDevices?: string }) => void;
  stop: () => void;
  isPaused?: () => boolean;
  XrController: { pipelineModule: () => unknown; configure: (o: Record<string, unknown>) => void; updateCameraProjectionMatrix: (o: { origin: THREE.Vector3; facing: THREE.Quaternion }) => void; recenter: () => void };
  GlTextureRenderer: { pipelineModule: () => unknown };
  Threejs: { pipelineModule: () => unknown; xrScene: () => { scene: THREE.Scene; camera: THREE.PerspectiveCamera; renderer: THREE.WebGLRenderer } };
  FullWindowCanvas: { pipelineModule: () => unknown };
  XrDevice?: { isDeviceBrowserCompatible: (o?: Record<string, unknown>) => boolean };
};

let loading: Promise<XR8Like> | null = null;

/** Loads the self-hosted 8th Wall engine (public/xr) once. The SLAM chunk is preloaded with the script. */
function loadEngine(): Promise<XR8Like> {
  const w = window as unknown as { XR8?: XR8Like; THREE?: typeof THREE };
  w.THREE = THREE; // the engine's three.js module reads window.THREE
  if (w.XR8) return Promise.resolve(w.XR8);
  loading ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = asset('/xr/xr.js');
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.dataset.preloadChunks = 'slam';
    s.onerror = () => reject(new Error('Não foi possível carregar o rastreamento de AR.'));
    setTimeout(() => reject(new Error('O rastreamento de AR demorou demais para carregar.')), 25000);
    window.addEventListener('xrloaded', () => resolve(w.XR8!), { once: true });
    document.head.appendChild(s);
  });
  return loading;
}

export type WorldEvents = {
  onTracking: (normal: boolean) => void;
  onPlaced: () => void;
  onDragged: () => void;
  onError: (message: string) => void;
  /** The engine could not run here (camera constraints, unsupported device): caller should use the gyro view. */
  onUnsupported: () => void;
};

/**
 * World-tracked AR (8th Wall SLAM, no ARCore needed): the camera's position and rotation are estimated from the video,
 * so the dish stays fixed on the table while the guest walks around it, leans in or looks from above.
 */
export async function startWorldAR(canvas: HTMLCanvasElement, modelUrl: string, events: WorldEvents) {
  const [XR8, dish] = await Promise.all([loadEngine(), loadDish(modelUrl)]);
  if (XR8.XrDevice && !XR8.XrDevice.isDeviceBrowserCompatible({ allowedDevices: 'mobile' })) throw new Error('unsupported');

  dish.group.visible = false;
  const table = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const ray = new THREE.Raycaster();
  const hit = new THREE.Vector3();
  let camera: THREE.PerspectiveCamera | null = null;
  let placed = false;
  let tracking = false;

  const tableAt = (ndcX: number, ndcY: number) => {
    if (!camera) return null;
    ray.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
    if (ray.ray.direction.y > -0.05) return null;
    return ray.ray.intersectPlane(table, hit) ? hit.clone() : null;
  };
  const putAt = (p: THREE.Vector3) => {
    if (!camera) return;
    dish.group.position.copy(p);
    dish.group.rotation.y = Math.atan2(camera.position.x - p.x, camera.position.z - p.z); // front faces the guest
    dish.group.visible = true;
  };
  const aim = () => {
    const p = tableAt(0, 0.05);
    if (!p) return false;
    putAt(p);
    if (!placed) { placed = true; events.onPlaced(); }
    return true;
  };

  const app = {
    name: 'menu-ar-dish',
    onStart: () => {
      const xr = XR8.Threejs.xrScene();
      camera = xr.camera;
      const { scene, renderer } = xr;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.shadowMap.enabled = true;
      const pmrem = new THREE.PMREMGenerator(renderer);
      import('three/examples/jsm/environments/RoomEnvironment.js').then(({ RoomEnvironment }) => {
        scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      });
      const sun = new THREE.DirectionalLight(0xffffff, 1.4);
      sun.position.set(0.4, 1.5, 0.6);
      sun.castShadow = true;
      scene.add(sun, dish.group);
      camera.position.set(0, START_HEIGHT_M, 0);
      XR8.XrController.updateCameraProjectionMatrix({ origin: camera.position, facing: camera.quaternion });
    },
    onUpdate: () => {
      if (tracking && !placed) aim(); // appear where the phone points once the table is recognised
    },
    // The engine draws the camera feed with raw GL on the shared context; three's state cache is stale after that,
    // so reset it and draw the dish ourselves on top.
    onRender: () => {
      const { scene, camera: cam, renderer } = XR8.Threejs.xrScene();
      renderer.resetState();
      renderer.clearDepth();
      renderer.render(scene, cam);
    },
    listeners: [
      {
        event: 'reality.trackingstatus',
        process: ({ detail }: { detail: { status: string } }) => {
          tracking = detail.status === 'NORMAL';
          events.onTracking(tracking);
        },
      },
    ],
    onCameraStatusChange: ({ status, reason }: { status: string; reason?: string }) => {
      if (status !== 'failed') return;
      if (reason === 'DENY_CAMERA') events.onError('A câmera foi bloqueada. Libere o acesso à câmera nas configurações do navegador e tente de novo.');
      else if (reason === 'NO_CAMERA') events.onError('Não encontramos uma câmera neste aparelho.');
      else events.onUnsupported();
    },
    onException: () => events.onUnsupported(),
  };

  // Drag with one finger: the dish follows the finger across the table.
  canvas.style.touchAction = 'none';
  let dragging = false;
  const toNdc = (e: PointerEvent) => {
    const b = canvas.getBoundingClientRect();
    return [((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1] as const;
  };
  const move = (e: PointerEvent) => {
    if (!dragging) return;
    const p = tableAt(...toNdc(e));
    if (p) { putAt(p); if (!placed) { placed = true; events.onPlaced(); } }
  };
  const down = (e: PointerEvent) => { dragging = true; canvas.setPointerCapture(e.pointerId); move(e); };
  const up = () => { if (dragging && placed) events.onDragged(); dragging = false; };
  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);

  // Size the drawing buffer to the screen ourselves; the engine's FullWindowCanvas would cover the page controls.
  const fit = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
  };
  fit();
  window.addEventListener('resize', fit);

  XR8.XrController.configure({ disableWorldTracking: false });
  XR8.addCameraPipelineModules([
    XR8.GlTextureRenderer.pipelineModule(),
    XR8.Threejs.pipelineModule(),
    XR8.XrController.pipelineModule(),
    app,
  ]);
  XR8.run({ canvas, allowedDevices: 'mobile' });

  return {
    place: () => aim(),
    recenter: () => { XR8.XrController.recenter(); placed = false; dish.group.visible = false; },
    setDishVisible: (v: boolean) => { dish.group.visible = v && placed; },
    stop() {
      window.removeEventListener('resize', fit);
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
      XR8.stop();
      XR8.clearCameraPipelineModules();
    },
  };
}
