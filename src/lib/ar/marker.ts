import * as THREE from 'three';
import { asset } from '@/lib/asset';
import { coverVideo, createStage, loadDish } from './stage';

/** Printed width of the table card's tracking image, in meters. The dish is scaled against it. */
export const CARD_WIDTH_M = 0.1;

type Events = { onStatus: (s: 'scanning' | 'found') => void };

/**
 * Image-tracking AR (MindAR): the table card is detected in the camera feed every frame and the dish is
 * anchored to it at real scale. Works on any phone with a camera; no ARCore/ARKit needed.
 */
export async function startMarkerAR(container: HTMLElement, video: HTMLVideoElement, modelUrl: string, { onStatus }: Events) {
  const [{ Controller }, dish] = await Promise.all([import('mind-ar/dist/mindar-image.prod.js'), loadDish(modelUrl)]);
  const stage = createStage(container);
  const { scene, camera, renderer, sun } = stage;

  const anchor = new THREE.Group();
  anchor.matrixAutoUpdate = false;
  anchor.visible = false;
  scene.add(anchor);
  // Anchor space: 1 unit = card width, card in the XY plane facing +Z. Dish is meters, Y up.
  const holder = new THREE.Group();
  holder.rotation.x = Math.PI / 2;
  holder.scale.setScalar(1 / CARD_WIDTH_M);
  holder.add(dish.group);
  anchor.add(holder);
  sun.position.set(0.6, 1.4, 1.2);
  sun.target = holder;
  sun.shadow.camera.left = sun.shadow.camera.bottom = -6;
  sun.shadow.camera.right = sun.shadow.camera.top = 6;

  let post = new THREE.Matrix4();
  const controller = new Controller({
    inputWidth: video.videoWidth,
    inputHeight: video.videoHeight,
    maxTrack: 1,
    filterMinCF: 0.0001,
    filterBeta: 0.004,
    onUpdate: (data: { type: string; worldMatrix: number[] | null }) => {
      if (data.type !== 'updateMatrix') return;
      if (data.worldMatrix) {
        anchor.matrix.fromArray(data.worldMatrix).multiply(post);
        if (!anchor.visible) onStatus('found');
        anchor.visible = true;
      } else {
        if (anchor.visible) onStatus('scanning');
        anchor.visible = false;
      }
    },
  });

  const layout = () => {
    coverVideo(video, container);
    stage.resize();
    // Same camera fit MindAR's own three.js adapter uses, so the overlay lines up with the video.
    const p = controller.getProjectionMatrix();
    const cw = container.clientWidth, ch = container.clientHeight;
    const inputAspect = controller.inputWidth / controller.inputHeight;
    const shownH = inputAspect > cw / ch ? ch : (cw / controller.inputWidth) * controller.inputHeight;
    camera.fov = (2 * Math.atan((1 / p[5]) * (ch / shownH)) * 180) / Math.PI;
    camera.near = p[14] / (p[10] - 1);
    camera.far = p[14] / (p[10] + 1);
    camera.updateProjectionMatrix();
  };

  const { dimensions } = await controller.addImageTargets(asset('/ar/cartao.mind'));
  const [w, h] = dimensions[0];
  post = new THREE.Matrix4().compose(new THREE.Vector3(w / 2, w / 2 + (h - w) / 2, 0), new THREE.Quaternion(), new THREE.Vector3(w, w, w));
  layout();
  window.addEventListener('resize', layout);
  await controller.dummyRun(video);
  controller.processVideo(video);
  onStatus('scanning');
  renderer.setAnimationLoop(() => renderer.render(scene, camera));

  return {
    setDishVisible: (v: boolean) => { holder.visible = v; },
    stop() {
      window.removeEventListener('resize', layout);
      controller.stopProcessVideo();
      stage.dispose();
    },
  };
}
