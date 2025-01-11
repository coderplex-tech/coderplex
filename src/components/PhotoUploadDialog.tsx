import { useState } from 'react';

interface PhotoUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  onDelete?: () => Promise<void>;
  hasExistingAvatar?: boolean;
}

export function PhotoUploadDialog({ 
  isOpen, 
  onClose, 
  onUpload, 
  onDelete, 
  hasExistingAvatar 
}: PhotoUploadDialogProps) {
  const [dragActive, setDragActive] = useState(false);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-800 rounded-xl p-6 max-w-md w-full shadow-xl 
      transform transition-all">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Upload Profile Photo
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 
            dark:hover:text-gray-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <label 
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer block
          transition-colors duration-200 mb-6
          ${dragActive 
            ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/10' 
            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
          }`}
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            const file = e.dataTransfer.files[0];
            if (file) onUpload(file);
          }}
        >
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
            }}
          />
          <div className="text-gray-600 dark:text-gray-400">
            <svg 
              className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <p className="mb-2">Drag and drop your photo here, or click to select</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">Maximum size: 2MB</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">Formats: JPEG, PNG, WebP</p>
          </div>
        </label>
        <div className="flex justify-end items-center gap-4">
          {hasExistingAvatar && onDelete && (
            <button
              onClick={onDelete}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 
              dark:text-red-400 dark:hover:text-red-300"
            >
              Delete Photo
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
            hover:text-gray-900 dark:hover:text-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
} 