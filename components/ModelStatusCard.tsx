
import React from 'react';
import { ModelRuntime, ModelLoadStatus } from '../types';
import Spinner from './Spinner';
import CheckIcon from './CheckIcon'; 

interface ModelStatusCardProps {
  modelRuntime: ModelRuntime;
}

const ModelStatusCard: React.FC<ModelStatusCardProps> = ({ modelRuntime }) => {
  const { config, status, error } = modelRuntime;

  let statusContent;
  let borderColor = 'border-slate-600/50'; 

  switch (status) {
    case ModelLoadStatus.LOADING:
      statusContent = (
        <div className="flex items-center w-full">
          <Spinner size="w-5 h-5 mr-3 shrink-0" color="text-sky-400" />
          <div className="flex-grow overflow-hidden">
            <p className="text-sky-300">Loading model...</p>
          </div>
        </div>
      );
      borderColor = 'border-sky-400/70';
      break;
    case ModelLoadStatus.LOADED:
      statusContent = (
        <div className="flex items-center w-full">
          <CheckIcon size="w-6 h-6 mr-2.5 shrink-0" color="text-emerald-400" />
          <div className="flex-grow overflow-hidden">
            <p className="text-emerald-300">Model loaded successfully.</p>
          </div>
        </div>
      );
      borderColor = 'border-emerald-500/70';
      break;
    case ModelLoadStatus.FAILED:
      statusContent = (
        <div className="flex items-center w-full">
          <Spinner size="w-5 h-5 mr-3 shrink-0" color="text-rose-400" />
          <div className="flex-grow overflow-hidden">
            <p className="text-rose-300 font-medium">Failed. Retrying...</p>
            {error && (
              <p className="text-xs text-rose-400/80 mt-0.5 truncate" title={error}>
                {error}
              </p>
            )}
          </div>
        </div>
      );
      borderColor = 'border-rose-500/70';
      break;
    case ModelLoadStatus.IDLE:
    default:
      statusContent = (
         <div className="flex items-center w-full">
          <Spinner size="w-5 h-5 mr-3 shrink-0" color="text-slate-500" />
          <div className="flex-grow overflow-hidden">
            <p className="text-slate-400">Pending initialization...</p>
          </div>
        </div>
      );
      borderColor = 'border-slate-600/50';
      break;
  }

  return (
    <div className={`glassmorphism p-3 rounded-lg shadow-xl text-slate-100 w-full h-28 flex flex-col justify-between border-2 ${borderColor} transition-all duration-300`}>
      <h3 className="text-lg font-semibold mb-1 truncate text-slate-100" title={config.name}>{config.name}</h3>
      <div className="mt-auto"> 
        {statusContent}
      </div>
    </div>
  );
};

export default ModelStatusCard;