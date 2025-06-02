
import { ModelConfig } from '../types';

export const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const preprocessImage = async (
  image: HTMLImageElement,
  config: ModelConfig
): Promise<Float32Array> => {
  const { targetSize, isGrayscale, inputShape } = config;
  const canvas = document.createElement('canvas');
  canvas.width = targetSize.width;
  canvas.height = targetSize.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Could not get 2D rendering context from canvas.');
  }

  ctx.drawImage(image, 0, 0, targetSize.width, targetSize.height);
  const imageData = ctx.getImageData(0, 0, targetSize.width, targetSize.height);
  const { data } = imageData; // data is Uint8ClampedArray: [R,G,B,A, R,G,B,A, ...]

  // Expected NHWC layout: [batch, height, width, channels]
  // For a single image, batch is 1.
  // Data needs to be float32 and normalized [0,1].
  const channels = isGrayscale ? 1 : 3;
  const expectedLength = targetSize.width * targetSize.height * channels;
  const float32Data = new Float32Array(expectedLength);

  if (isGrayscale) { // Output shape e.g. [1, 150, 150, 1]
    if (channels !== 1) throw new Error("Grayscale model expects 1 channel in inputShape.");
    for (let i = 0; i < data.length / 4; i++) {
      const r = data[i * 4];
      const g = data[i * 4 + 1];
      const b = data[i * 4 + 2];
      // Standard luminance calculation
      const gray = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;
      float32Data[i] = gray; // Storing as HWC with C=1
    }
  } else { // RGB, output shape e.g. [1, 224, 224, 3]
    if (channels !== 3) throw new Error("RGB model expects 3 channels in inputShape.");
    for (let i = 0; i < data.length / 4; i++) {
      const r = data[i * 4] / 255.0;
      const g = data[i * 4 + 1] / 255.0;
      const b = data[i * 4 + 2] / 255.0;
      float32Data[i * 3] = r;
      float32Data[i * 3 + 1] = g;
      float32Data[i * 3 + 2] = b; // Storing as HWC with C=3, interleaved
    }
  }
  
  // Verify final tensor shape aligns with inputShape (excluding batch)
  const modelHeight = inputShape[1];
  const modelWidth = inputShape[2];
  const modelChannels = inputShape[3];
  if (modelHeight !== targetSize.height || modelWidth !== targetSize.width || modelChannels !== channels) {
    console.warn("Mismatch between targetSize/isGrayscale and model's inputShape dimensions for HWC. Ensure data layout is correct for model.", 
    {modelHeight, modelWidth, modelChannels}, {targetHeight: targetSize.height, targetWidth: targetSize.width, channels});
  }

  return float32Data;
};
