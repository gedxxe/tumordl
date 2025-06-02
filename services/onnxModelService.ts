
import * as ort from 'onnxruntime-web';
import { ModelConfig, CLASS_LABELS, TumorClass, InferenceResult } from '../types';
import { preprocessImage, loadImage } from '../utils/imageProcessor';

// --- BEGIN ADDED/MODIFIED CODE ---
// Explicitly set the path for WASM backend files.
// This is crucial when ORT is loaded via certain CDNs or module systems like esm.sh.
// We use a specific version to ensure stability, matching the version in the importmap.
// The importmap uses ^1.22.0, so we'll use 1.22.0 as a stable reference.
// Adjust this version if your importmap version for onnxruntime-web changes significantly.
const ORT_WEB_VERSION = '1.22.0'; 
ort.env.wasm.wasmPaths = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORT_WEB_VERSION}/dist/`;

// Optional: Configure WASM multithreading and WebGPU power preference
// ort.env.wasm.numThreads = navigator.hardwareConcurrency || 4;
// ort.env.webgpu.powerPreference = 'high-performance';
// --- END ADDED/MODIFIED CODE ---

export const loadModel = async (config: ModelConfig): Promise<ort.InferenceSession> => {
  try {
    // ORT Web will attempt to use the best available execution provider.
    // Default order is often WebGPU, then WASM.
    // To explicitly set execution providers if needed:
    // const session = await ort.InferenceSession.create(config.path, { executionProviders: ['webgpu', 'wasm'] });
    const session = await ort.InferenceSession.create(config.path);
    
    // Log which execution provider was chosen - ONNX Runtime itself will log this if logLevel is verbose.
    // We log input/output names here for confirmation.
    console.log(`Model ${config.name} loaded successfully. Input names: ${session.inputNames.join(', ')}, Output names: ${session.outputNames.join(', ')}`);
    
    if (session.inputNames.length === 0 || session.outputNames.length === 0) {
        throw new Error(`Model ${config.name} has no input or output names defined in the ONNX file.`);
    }
    return session;
  } catch (e) {
    console.error(`Failed to load ONNX model ${config.name} from ${config.path}:`, e);
    throw new Error(`Failed to load ${config.name}: ${(e as Error).message}`);
  }
};

export const runInference = async (
  session: ort.InferenceSession,
  imageFile: File,
  config: ModelConfig,
  inputName: string, 
  outputName: string 
): Promise<InferenceResult> => {
  const startTime = performance.now();
  try {
    const imageElement = await loadImage(imageFile);
    const preprocessedData = await preprocessImage(imageElement, config);
    
    const tensor = new ort.Tensor('float32', preprocessedData, config.inputShape);
    const feeds: Record<string, ort.Tensor> = {};
    feeds[inputName] = tensor;

    const results = await session.run(feeds);
    const outputTensor = results[outputName];

    if (!outputTensor) {
      throw new Error(`Output tensor '${outputName}' not found in model results.`);
    }

    const probabilities = outputTensor.data as Float32Array;
    
    let maxProb = -1;
    let predictedIndex = -1;
    for (let i = 0; i < probabilities.length; i++) {
      if (probabilities[i] > maxProb) {
        maxProb = probabilities[i];
        predictedIndex = i;
      }
    }
    
    if (predictedIndex < 0 || predictedIndex >= CLASS_LABELS.length) {
        throw new Error(`Predicted index ${predictedIndex} is out of bounds for CLASS_LABELS.`);
    }

    const endTime = performance.now();
    const processingTime = endTime - startTime;

    return {
      modelId: config.id,
      modelName: config.name,
      label: CLASS_LABELS[predictedIndex] as TumorClass,
      confidence: maxProb,
      processingTime: processingTime,
    };

  } catch (e) {
    console.error(`Error during inference for ${config.name}:`, e);
    const endTime = performance.now();
    return {
      modelId: config.id,
      modelName: config.name,
      label: 'Error',
      confidence: 0,
      error: (e as Error).message,
      processingTime: endTime - startTime,
    };
  }
};
