/** Rear camera stream for the camera preview; throws an Error whose message is ready to show to the guest. */
export async function openCamera(video: HTMLVideoElement) {
  if (!navigator.mediaDevices?.getUserMedia) throw new Error('Este navegador não permite usar a câmera. Abra o cardápio no Chrome ou no Safari.');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } });
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    await video.play();
    return stream;
  } catch (e) {
    const name = (e as DOMException).name;
    if (name === 'NotAllowedError' || name === 'SecurityError') throw new Error('A câmera foi bloqueada. Libere o acesso à câmera nas configurações do navegador (ícone de cadeado) e tente de novo.');
    if (name === 'NotFoundError' || name === 'OverconstrainedError') throw new Error('Não encontramos uma câmera neste aparelho.');
    if (name === 'NotReadableError') throw new Error('A câmera está sendo usada por outro aplicativo. Feche-o e tente de novo.');
    throw new Error('Não foi possível abrir a câmera.');
  }
}

type XRNavigator = Navigator & { xr?: { isSessionSupported: (mode: string) => Promise<boolean> } };

/**
 * Whether the phone has the system AR that commercial AR menus rely on: Quick Look (iOS) or WebXR on Android, which
 * Chrome only reports when the device supports ARCore. Phones without it get the camera preview instead.
 */
export async function hasNativeAR() {
  const a = document.createElement('a');
  if (a.relList?.supports?.('ar')) return true; // iOS Quick Look
  try {
    return (await (navigator as XRNavigator).xr?.isSessionSupported('immersive-ar')) ?? false;
  } catch {
    return false;
  }
}
