
import { InferenceSession } from 'onnxruntime-web';

export enum ModelLoadStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  LOADED = 'loaded',
  FAILED = 'failed',
}

export interface ModelConfig {
  id: string;
  name: string;
  path: string;
  inputShape: number[]; // NHWC format: [batch, height, width, channels]
  isGrayscale: boolean;
  targetSize: { width: number; height: number };
}

export interface ModelRuntime {
  config: ModelConfig;
  session: InferenceSession | null;
  status: ModelLoadStatus;
  error: string | null;
  inputName: string | null;
  outputName: string | null;
}

export interface InferenceResult {
  modelId: string;
  modelName: string;
  label: string;
  confidence: number;
  error?: string;
  processingTime?: number; // milliseconds
}

export const CLASS_LABELS = ['glioma', 'meningioma', 'notumor', 'pituitary'] as const;
export type TumorClass = typeof CLASS_LABELS[number];
