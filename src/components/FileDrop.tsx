import { useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import { formatFileSize } from '../utils/formatters';

interface FileDropProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function FileDrop({ onFileSelect, disabled = false }: FileDropProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`
        border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
        transition-all duration-200
        ${isDragging ? 'border-dark-accent bg-dark-accent bg-opacity-10' : 'border-dark-border'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-dark-accent hover:bg-dark-surface'}
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {selectedFile ? (
        <div className="space-y-3">
          <div className="text-dark-success text-5xl">✓</div>
          <div>
            <p className="text-dark-text font-semibold text-lg">{selectedFile.name}</p>
            <p className="text-dark-muted text-sm mt-1">{formatFileSize(selectedFile.size)}</p>
            <p className="text-dark-muted text-xs mt-1">
              Last modified: {new Date(selectedFile.lastModified).toLocaleDateString()}
            </p>
          </div>
          {!disabled && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
              }}
              className="text-dark-accent hover:text-blue-400 text-sm mt-2"
            >
              Change file
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-dark-muted text-5xl">📁</div>
          <div>
            <p className="text-dark-text font-semibold">
              {isDragging ? 'Drop file here' : 'Drag and drop a file'}
            </p>
            <p className="text-dark-muted text-sm mt-1">or click to browse</p>
          </div>
        </div>
      )}
    </div>
  );
}
