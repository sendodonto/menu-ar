import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { asset } from '@/lib/asset';

/** Transparent three.js layer drawn over the camera video: renderer, scene, lights and a soft contact shadow. */
export function createStage(container: HTMLElement) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  Object.assign(renderer.domElement.style, { position: 'absolute', inset: '0', width: '100%', height: '100%' });
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.radius = 6;
  scene.add(sun, sun.target);

  const camera = new THREE.PerspectiveCamera(60, 1, 0.01, 50);
  const resize = () => {
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();

  return {
    renderer, scene, camera, sun, resize,
    dispose() {
      renderer.setAnimationLoop(null);
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}

/**
 * Loads a dish GLB (meters, Y up, base at y = 0) and returns it inside a group whose origin is the plate's base,
 * with a shadow-catcher disc under it so the dish reads as resting on the table.
 */
export async function loadDish(url: string) {
  const draco = new DRACOLoader().setDecoderPath(asset('/draco/'));
  const gltf = await new GLTFLoader().setDRACOLoader(draco).loadAsync(url);
  draco.dispose();
  const dish = gltf.scene;
  dish.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true; }
  });
  const box = new THREE.Box3().setFromObject(dish);
  const size = box.getSize(new THREE.Vector3());
  const radius = Math.max(size.x, size.z) * 0.75;
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(radius, 48), new THREE.ShadowMaterial({ opacity: 0.32 }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = box.min.y + 0.0005;
  shadow.receiveShadow = true;
  const group = new THREE.Group();
  dish.position.y -= box.min.y;
  group.add(dish, shadow);
  return { group, size };
}

/** Rear camera stream; throws an Error whose message is ready to show to the guest. */
export async function openCamera(video: HTMLVideoElement) {
  if (!navigator.mediaDevices?.getUserMedia) throw new Error('Este navegador não permite usar a câmera. Abra o cardápio no Chrome ou no Safari.');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } });
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    await video.play();
    if (!video.videoWidth) await new Promise((r) => video.addEventListener('loadedmetadata', r, { once: true }));
    // MindAR reads frames at the element's width/height attributes, not its intrinsic size.
    video.width = video.videoWidth;
    video.height = video.videoHeight;
    return stream;
  } catch (e) {
    const name = (e as DOMException).name;
    if (name === 'NotAllowedError' || name === 'SecurityError') throw new Error('A câmera foi bloqueada. Libere o acesso à câmera nas configurações do navegador (ícone de cadeado) e tente de novo.');
    if (name === 'NotFoundError' || name === 'OverconstrainedError') throw new Error('Não encontramos uma câmera neste aparelho.');
    if (name === 'NotReadableError') throw new Error('A câmera está sendo usada por outro aplicativo. Feche-o e tente de novo.');
    throw new Error('Não foi possível abrir a câmera.');
  }
}

/** Positions a <video> so it covers the container like object-fit: cover; returns the display scale. */
export function coverVideo(video: HTMLVideoElement, container: HTMLElement) {
  const cw = container.clientWidth, ch = container.clientHeight, vw = video.videoWidth, vh = video.videoHeight;
  const s = Math.max(cw / vw, ch / vh);
  Object.assign(video.style, { position: 'absolute', width: `${vw * s}px`, height: `${vh * s}px`, left: `${(cw - vw * s) / 2}px`, top: `${(ch - vh * s) / 2}px`, objectFit: 'fill' });
  return s;
}
