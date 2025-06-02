
import React, { useState, useCallback, useRef } from 'react';
import { ACCEPTED_IMAGE_TYPES } from '../constants';

interface FileUploadProps {
  onFileSelect: (file: File, previewUrl: string) => void;
  disabled: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    if (file) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setError('Invalid file type. Please upload a JPG or PNG image.');
        setSelectedFileName(null); 
        if(fileInputRef.current) fileInputRef.current.value = ""; 
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      setSelectedFileName(file.name);
      onFileSelect(file, previewUrl);
    } else {
      setSelectedFileName(null);
    }
  }, [onFileSelect]);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="glassmorphism p-6 md:p-8 rounded-lg shadow-xl text-slate-100 w-full max-w-lg mx-auto">
      <h3 className="text-xl md:text-2xl font-semibold mb-6 text-center text-slate-100">Upload Brain MRI Scan</h3>
      <input
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
        disabled={disabled}
        aria-label="Upload brain MRI scan"
      />
      <button
        onClick={handleButtonClick}
        disabled={disabled}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-lg transition-all duration-200 ease-in-out text-white
                    bg-fuchsia-600 hover:bg-fuchsia-700 focus:outline-none focus:ring-4 focus:ring-fuchsia-500 focus:ring-opacity-50
                    disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transform active:scale-95`}
        aria-describedby={error ? "file-upload-error" : undefined}
      >
        {selectedFileName ? `Selected: ${selectedFileName}` : 'Choose Image (JPG, PNG)'}
      </button>
      {error && <p id="file-upload-error" role="alert" className="text-rose-300 bg-rose-900/50 p-2 rounded mt-3 text-sm text-center">{error}</p>}
    </div>
  );
};

export default FileUpload;