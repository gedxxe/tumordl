
import { ModelConfig } from './types';

export const APP_TITLE = "Advanced Brain Tumor Detection Based on Deep Learning";

export const MODEL_CONFIGS: ModelConfig[] = [
  {
    id: 'cnn',
    name: 'CNN Model',
    path: './model_cnn.onnx', // Ensure these models are in the same directory as index.html (e.g., project root for Vercel deployment)
    inputShape: [1, 150, 150, 1], // NHWC
    isGrayscale: true,
    targetSize: { width: 150, height: 150 },
  },
  {
    id: 'mobilenet',
    name: 'MobileNetV2 Model',
    path: './model_mobilenet.onnx', // Ensure these models are in the same directory as index.html (e.g., project root for Vercel deployment)
    inputShape: [1, 224, 224, 3], // NHWC
    isGrayscale: false,
    targetSize: { width: 224, height: 224 },
  },
];

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png'];
