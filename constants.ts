
import { ModelConfig } from './types';

export const APP_TITLE = "Advanced Brain Tumor Detection Based on Deep Learning";

export const MODEL_CONFIGS: ModelConfig[] = [
  {
    id: 'cnn',
    name: 'CNN Model',
    path: './model_cnn.onnx',
    inputShape: [1, 150, 150, 1], // NHWC
    isGrayscale: true,
    targetSize: { width: 150, height: 150 },
  },
  {
    id: 'mobilenet',
    name: 'MobileNetV2 Model',
    path: './model_mobilenet.onnx',
    inputShape: [1, 224, 224, 3], // NHWC
    isGrayscale: false,
    targetSize: { width: 224, height: 224 },
  },
  {
    id: 'densenet169',
    name: 'DenseNet169 Model',
    path: './model_densenet169.onnx',
    inputShape: [1, 224, 224, 3], // NHWC - Assumed
    isGrayscale: false,             // Assumed
    targetSize: { width: 224, height: 224 }, // Assumed
  },
  {
    id: 'mobilenetv3',
    name: 'MobileNetV3 Model',
    path: './model_mobilenetv3.onnx',
    inputShape: [1, 224, 224, 3], // NHWC - Assumed
    isGrayscale: false,             // Assumed
    targetSize: { width: 224, height: 224 }, // Assumed
  },
  {
    id: 'resnet152',
    name: 'ResNet152 Model',
    path: './model_resnet152.onnx',
    inputShape: [1, 224, 224, 3], // NHWC - Assumed
    isGrayscale: false,             // Assumed
    targetSize: { width: 224, height: 224 }, // Assumed
  },
  {
    id: 'vgg19',
    name: 'VGG19 Model',
    path: './model_vgg19.onnx',
    inputShape: [1, 224, 224, 3], // NHWC - Assumed
    isGrayscale: false,             // Assumed
    targetSize: { width: 224, height: 224 }, // Assumed
  },
];

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png'];
