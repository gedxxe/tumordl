
import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as ort from 'onnxruntime-web';
import TypewriterTitle from './components/TypewriterTitle';
import FileUpload from './components/FileUpload';
import ModelStatusCard from './components/ModelStatusCard';
import ResultCard from './components/ResultCard';
import Spinner from './components/Spinner';
import AboutUs from './components/AboutUs'; 
import { MODEL_CONFIGS } from './constants';
import { ModelRuntime, ModelLoadStatus, InferenceResult } from './types';
import { loadModel, runInference } from './services/onnxModelService';

const App: React.FC = () => {
  const [modelRuntimes, setModelRuntimes] = useState<ModelRuntime[]>(
    MODEL_CONFIGS.map(config => ({
      config,
      session: null,
      status: ModelLoadStatus.IDLE,
      error: null,
      inputName: null,
      outputName: null,
    }))
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [inferenceResults, setInferenceResults] = useState<(InferenceResult | null)[]>(
    MODEL_CONFIGS.map(() => null)
  );
  const [isInferring, setIsInferring] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  const [showAboutUsPopup, setShowAboutUsPopup] = useState(true);
  const aboutUsSectionWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const initializeModels = async () => {
      ort.env.logLevel = 'warning'; 

      const loadPromises = MODEL_CONFIGS.map(async (config, index) => {
        setModelRuntimes(prev =>
          prev.map((mr, i) =>
            i === index ? { ...mr, status: ModelLoadStatus.LOADING } : mr
          )
        );
        try {
          const session = await loadModel(config);
          if (!session.inputNames[0] || !session.outputNames[0]) {
            throw new Error("Model is missing input or output names.");
          }
          setModelRuntimes(prev =>
            prev.map((mr, i) =>
              i === index
                ? { ...mr, session, status: ModelLoadStatus.LOADED, inputName: session.inputNames[0], outputName: session.outputNames[0] }
                : mr
            )
          );
        } catch (error) {
          setModelRuntimes(prev =>
            prev.map((mr, i) =>
              i === index
                ? { ...mr, status: ModelLoadStatus.FAILED, error: (error as Error).message }
                : mr
            )
          );
        }
      });
      await Promise.allSettled(loadPromises);
    };

    initializeModels();
  }, []);

  useEffect(() => {
    if (!aboutUsSectionWrapperRef.current || !isMounted) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show popup if the AboutUs section is NOT intersecting (e.g., scrolled out of view)
        // Hide popup if the AboutUs section IS intersecting (e.g., user scrolled to it)
        setShowAboutUsPopup(!entry.isIntersecting);
      },
      { threshold: 0.1 } // Adjust threshold as needed: 0.1 means 10% of the element is visible
    );

    const currentRef = aboutUsSectionWrapperRef.current;
    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [isMounted]); 

  const handleFileSelect = useCallback((file: File, previewUrl: string) => {
    setSelectedFile(file);
    setImagePreviewUrl(previewUrl);
    setInferenceResults(MODEL_CONFIGS.map(() => null)); 
    setGlobalError(null);
  }, []);

  const handleRunInference = useCallback(async () => {
    if (!selectedFile) {
      setGlobalError("Please select an image first.");
      return;
    }

    const activeModels = modelRuntimes.filter(
      mr => mr.status === ModelLoadStatus.LOADED && mr.session && mr.inputName && mr.outputName
    );

    if (activeModels.length === 0) {
      setGlobalError("No models are currently loaded successfully. Cannot run inference.");
      return;
    }
    
    setIsInferring(true);
    setGlobalError(null);
    setInferenceResults(prev => {
        const newResults = [...prev];
        activeModels.forEach(activeModel => {
            const modelIndex = MODEL_CONFIGS.findIndex(mc => mc.id === activeModel.config.id);
            if (modelIndex !== -1) {
                newResults[modelIndex] = null; 
            }
        });
        return newResults;
    });


    const inferencePromises = activeModels.map(async (modelRuntime) => {
      const session = modelRuntime.session!;
      const inputName = modelRuntime.inputName!;
      const outputName = modelRuntime.outputName!;
      return runInference(session, selectedFile, modelRuntime.config, inputName, outputName);
    });

    const results = await Promise.allSettled(inferencePromises);

    setInferenceResults(prevResults => {
      const newResults = [...prevResults];
      results.forEach(settledResult => {
        if (settledResult.status === 'fulfilled') {
          const resultValue = settledResult.value;
          const modelIndex = MODEL_CONFIGS.findIndex(mc => mc.id === resultValue.modelId);
          if (modelIndex !== -1) {
            newResults[modelIndex] = resultValue;
          }
        } 
      });
      return newResults;
    });
    
    setIsInferring(false);
  }, [selectedFile, modelRuntimes]);

  useEffect(() => {
    if (selectedFile && !isInferring) {
      const canRunAnyInference = modelRuntimes.some(mr => mr.status === ModelLoadStatus.LOADED);
      if(canRunAnyInference){
        handleRunInference();
      }
    }
  }, [selectedFile, handleRunInference, modelRuntimes]); 

  const handleScrollToAboutUs = () => {
    const aboutUsElement = document.getElementById('about-us-content');
    if (aboutUsElement) {
      aboutUsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setShowAboutUsPopup(false); // Hide popup immediately on click
  };

  const anyModelStillLoading = modelRuntimes.some(mr => mr.status === ModelLoadStatus.LOADING || mr.status === ModelLoadStatus.IDLE);
  const allModelsFailedToLoadInitially = modelRuntimes.every(mr => mr.status === ModelLoadStatus.FAILED);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-pink-800 text-slate-200 py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center selection:bg-fuchsia-500 selection:text-white">
      
      <div className={`w-full max-w-6xl mb-8 animate-slide-up-fade ${isMounted ? 'is-visible' : ''}`} style={{transitionDelay: '0ms'}}>
        <TypewriterTitle />
      </div>

      {globalError && (
          <div 
              role="alert"
              className={`my-4 p-4 bg-rose-800/50 text-rose-100 rounded-lg glassmorphism max-w-2xl mx-auto text-center animate-slide-up-fade ${isMounted ? 'is-visible' : ''}`}
              style={{ transitionDelay: `100ms` }}
          >
          {globalError}
          </div>
      )}
      
      <div className="w-full max-w-7xl flex-grow flex flex-col md:flex-row gap-x-8 gap-y-4 mt-2">
        <div className={`md:w-2/5 lg:w-1/3 flex flex-col gap-4 animate-slide-up-fade ${isMounted ? 'is-visible animate-slide-in-left' : 'opacity-0'}`} style={{ animationDelay: '200ms', transitionDelay: '200ms' }}>
          <section aria-labelledby="model-status-heading" className="flex-grow flex flex-col">
            <h2 id="model-status-heading" className="text-2xl font-semibold text-center text-slate-100 mb-4">Model Status</h2>
            {anyModelStillLoading && !allModelsFailedToLoadInitially && modelRuntimes.filter(mr => mr.status === ModelLoadStatus.IDLE || mr.status === ModelLoadStatus.LOADING).length > 0 ? (
                <div className={`flex-grow flex justify-center items-center p-6 glassmorphism rounded-lg animate-slide-up-fade ${isMounted ? 'is-visible' : ''}`}>
                    <Spinner size="w-10 h-10" color="text-sky-400" />
                    <p className="ml-4 text-lg text-slate-200">Initializing models...</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                {modelRuntimes.map((mr, index) => (
                    <div 
                      key={mr.config.id} 
                      className={`animate-slide-up-fade ${isMounted ? 'is-visible' : ''}`}
                      style={{ transitionDelay: `${300 + index * 100}ms` }}
                    >
                      <ModelStatusCard modelRuntime={mr} />
                    </div>
                ))}
                </div>
            )}
          </section>
          
          <section aria-labelledby="file-upload-heading" className={`animate-slide-up-fade ${isMounted ? 'is-visible' : ''}`} style={{ transitionDelay: '400ms' }}>
            <h2 id="file-upload-heading" className="sr-only">File Upload</h2>
            <FileUpload 
                onFileSelect={handleFileSelect} 
                disabled={anyModelStillLoading || isInferring || allModelsFailedToLoadInitially } 
            />
          </section>
        </div>

        <div className={`hidden md:block border-l border-slate-700/50 self-stretch animate-slide-up-fade ${isMounted ? 'is-visible' : ''}`} style={{animationDelay: '300ms', transitionDelay: '300ms'}}></div>

        <div className={`md:w-3/5 lg:w-2/3 flex flex-col gap-4 animate-slide-up-fade ${isMounted ? 'is-visible animate-slide-in-right' : 'opacity-0'}`} style={{ animationDelay: '200ms', transitionDelay: '200ms' }}>
          {imagePreviewUrl && (
              <section aria-labelledby="image-preview-heading" className={`w-full animate-slide-up-fade ${isMounted ? 'is-visible' : ''}`} style={{ transitionDelay: '500ms' }}>
                  <h3 id="image-preview-heading" className="text-2xl font-semibold text-center text-slate-200 mb-4">Uploaded Image</h3>
                  <div className="flex justify-center">
                    <img 
                        src={imagePreviewUrl} 
                        alt="Uploaded brain scan" 
                        className="rounded-lg shadow-xl glassmorphism p-1 max-w-xs md:max-w-sm h-auto object-contain" 
                        style={{maxHeight: '200px'}}
                    />
                  </div>
              </section>
          )}

          <section aria-labelledby="inference-results-heading" className="flex-grow flex flex-col">
            <h2 id="inference-results-heading" className="text-2xl font-semibold text-center text-slate-100 mb-6">Inference Results</h2>
            {anyModelStillLoading && !allModelsFailedToLoadInitially && modelRuntimes.filter(mr => mr.status === ModelLoadStatus.IDLE || mr.status === ModelLoadStatus.LOADING).length > 0 ? (
                <div className={`flex-grow flex justify-center items-center p-6 glassmorphism rounded-lg animate-slide-up-fade ${isMounted ? 'is-visible' : ''}`} style={{ transitionDelay: `${600}ms` }}>
                    <Spinner size="w-10 h-10" color="text-sky-400" />
                    <p className="ml-4 text-lg text-slate-200">Preparing result viewers...</p>
                </div>
            ) : (
                <div className={`grid grid-cols-1 ${MODEL_CONFIGS.length > 1 ? 'lg:grid-cols-2' : ''} gap-6`}>
                {modelRuntimes.map((runtime, index) => (
                    <div 
                        key={runtime.config.id}
                        className={`animate-slide-up-fade ${isMounted ? 'is-visible' : ''}`}
                        style={{ transitionDelay: `${600 + index * 100}ms` }} 
                    >
                        <ResultCard 
                            modelRuntime={runtime}
                            inferenceOutput={inferenceResults[index]}
                            isGloballyInferring={isInferring}
                            hasFileSelected={selectedFile !== null}
                        />
                    </div>
                ))}
                </div>
            )}
          </section>
        </div>
      </div>

      <div 
        ref={aboutUsSectionWrapperRef}
        className={`w-full max-w-6xl mt-80 animate-slide-up-fade ${isMounted ? 'is-visible' : ''}`} // Increased margin-top
        style={{transitionDelay: '700ms'}}
      >
        <AboutUs />
      </div>

      {isMounted && showAboutUsPopup && (
        <div 
            className={`fixed bottom-32 right-0 z-50 transition-all duration-400 ease-out animate-popup-container-fade-in`} // Changed right-4 to right-8
            style={{ animationDelay: '1200ms' }}
        >
            <button
                onClick={handleScrollToAboutUs}
                aria-label="Scroll to About Us section"
                className={`
                    transform -rotate-90 origin-bottom-right 
                    py-3 px-4 
                    bg-fuchsia-600/80 hover:bg-fuchsia-500/90 backdrop-blur-sm 
                    text-slate-100 font-semibold tracking-wider whitespace-nowrap
                    rounded-t-md 
                    shadow-xl 
                    transition-all duration-200
                    focus:outline-none focus:ring-2 ring-offset-transparent focus:ring-fuchsia-400 
                `} // Changed px-6 to px-4
            >
                ABOUT US
            </button>
        </div>
      )}

      <footer className={`mt-16 text-center text-slate-400 text-sm animate-slide-up-fade ${isMounted ? 'is-visible' : ''}`} style={{transitionDelay: '800ms'}}>
        <p>&copy; {new Date().getFullYear()} UEESRG Team. For research purposes only.</p>
      </footer>
    </div>
  );
};

export default App;
