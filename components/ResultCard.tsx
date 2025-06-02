
import React from 'react';
import { InferenceResult, ModelRuntime, ModelLoadStatus } from '../types';
import Spinner from './Spinner';

interface ResultCardProps {
  modelRuntime: ModelRuntime;
  inferenceOutput: InferenceResult | null;
  isGloballyInferring: boolean;
  hasFileSelected: boolean;
}

const ResultCard: React.FC<ResultCardProps> = ({ 
    modelRuntime, 
    inferenceOutput, 
    isGloballyInferring, 
    hasFileSelected 
}) => {
  const { config: modelConfig, status: modelStatus, error: modelLoadError } = modelRuntime;

  const cardBaseStyle = "glassmorphism p-3 md:p-4 rounded-lg shadow-xl text-slate-100 w-full flex flex-col min-h-[200px] transition-all duration-300 ease-in-out";

  if (modelStatus === ModelLoadStatus.FAILED) {
    return (
      <div className={`${cardBaseStyle} items-start text-left border-2 border-rose-500/70`}>
        <h3 className="text-lg md:text-xl font-semibold mb-2 border-b border-slate-600/50 pb-1.5 w-full truncate text-slate-100" title={modelConfig.name}>{modelConfig.name}</h3>
        <p className="font-semibold text-rose-300 text-sm">Model Load Error:</p>
        <p className="text-xs text-rose-400 break-words">{modelLoadError || "Unknown error"}</p> {/* Removed mb-1.5 */}
        <p className="text-sm mt-auto pt-0.5 border-t border-slate-700/40 w-full"><span className="font-medium text-slate-400">Prediction:</span> <span className="ml-2 text-slate-500">N/A</span></p> {/* Changed pt-1.5 to pt-0.5 */}
        <p className="text-sm"><span className="font-medium text-slate-400">Confidence:</span> <span className="ml-2 text-slate-500">N/A</span></p>
      </div>
    );
  }

  if (modelStatus === ModelLoadStatus.LOADING) {
    return (
      <div className={`${cardBaseStyle} items-center justify-center border-2 border-sky-500/70 opacity-80`}>
        <Spinner size="w-8 h-8 text-sky-300" />
        <p className="mt-2.5 text-md text-sky-300">Initializing {modelConfig.name}...</p>
      </div>
    );
  }
  
  if (modelStatus === ModelLoadStatus.IDLE) {
    return (
      <div className={`${cardBaseStyle} items-center justify-center opacity-60 border-2 border-slate-600/70`}>
         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-500 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
        <p className="mt-1.5 text-sm text-slate-400 text-center">{modelConfig.name}: Pending initialization.</p>
      </div>
    );
  }

  const isInferringThisModel = modelStatus === ModelLoadStatus.LOADED && 
                               hasFileSelected && 
                               isGloballyInferring && 
                               inferenceOutput === null;
  if (isInferringThisModel) {
    return (
      <div className={`${cardBaseStyle} items-center justify-center border-2 border-purple-500/70`}>
        <Spinner size="w-8 h-8 text-purple-400" />
        <p className="mt-2.5 text-md text-purple-300">Analyzing with {modelConfig.name}...</p>
      </div>
    );
  }

  if (inferenceOutput) {
    return (
      <div className={`${cardBaseStyle} items-start text-left ${inferenceOutput.error ? 'border-2 border-orange-500/70' : 'border-2 border-emerald-500/70'}`}>
        <h3 className="text-lg md:text-xl font-semibold mb-2 border-b border-slate-600/50 pb-1.5 w-full truncate text-slate-100" title={modelConfig.name}>{modelConfig.name}</h3>
        {inferenceOutput.error ? (
          <div className="text-orange-300">
              <p className="font-semibold text-md">Inference Error:</p>
              <p className="text-xs break-words">{inferenceOutput.error}</p>
          </div>
        ) : (
          <>
            <p className="text-md mb-1 w-full">
              <span className="font-medium text-slate-300">Prediction:</span> 
              <span className="ml-2 capitalize px-2.5 py-0.5 rounded-full bg-purple-600 text-slate-100 text-sm shadow-md">{inferenceOutput.label}</span>
            </p>
            <p className="text-md mb-1.5 w-full">
              <span className="font-medium text-slate-300">Confidence:</span>
              <span className="ml-2 font-mono text-emerald-300 text-lg">{(inferenceOutput.confidence * 100).toFixed(2)}%</span>
            </p>
            {inferenceOutput.processingTime !== undefined && (
               <p className="text-[11px] text-slate-400 mt-auto pt-1.5 w-full border-t border-slate-700/40">
                  Processing Time: {inferenceOutput.processingTime.toFixed(2)} ms
              </p>
            )}
          </>
        )}
      </div>
    );
  }

  if (modelStatus === ModelLoadStatus.LOADED) {
    const message = hasFileSelected ? 
      `${modelConfig.name}: Awaiting analysis...` : 
      `${modelConfig.name}: Ready. Upload an image.`;
    return (
        <div className={`${cardBaseStyle} items-center justify-center opacity-70 border-2 border-slate-500/70`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-md text-slate-400 text-center">{message}</p>
        </div>
      );
  }
  
  return (
    <div className={`${cardBaseStyle} items-center justify-center opacity-50 border-2 border-slate-700/50`}>
        <p className="text-md text-slate-500">{modelConfig.name}: Status Unknown</p>
    </div>
  );
};

export default ResultCard;
