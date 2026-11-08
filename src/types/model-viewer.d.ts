import type { DetailedHTMLProps, HTMLAttributes } from 'react';

type ModelViewerAttributes = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  src?: string;
  alt?: string;
  ar?: boolean;
  'ar-modes'?: string;
  'ar-scale'?: string;
  'ar-placement'?: string;
  'camera-controls'?: boolean;
  'touch-action'?: string;
  'auto-rotate'?: boolean;
  'auto-rotate-delay'?: string;
  'rotation-per-second'?: string;
  'interaction-prompt'?: string;
  'shadow-intensity'?: string;
  'shadow-softness'?: string;
  'environment-image'?: string;
  exposure?: string;
  'camera-orbit'?: string;
  'min-camera-orbit'?: string;
  'max-camera-orbit'?: string;
  'field-of-view'?: string;
  'tone-mapping'?: string;
  loading?: string;
  reveal?: string;
  scale?: string;
  'xr-environment'?: boolean;
};

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerAttributes;
    }
  }
}

/** The subset of the <model-viewer> element API this app calls. */
export interface ModelViewerElement extends HTMLElement {
  canActivateAR: boolean;
  loaded: boolean;
  activateAR(): Promise<void>;
  getDimensions(): { x: number; y: number; z: number };
}
