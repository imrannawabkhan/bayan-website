"use client";
import { ChangeEvent, useState, useEffect } from 'react';
import { FileUploaderProps } from '@/interfaces';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface UploadResponse {
  link: string;
}

export default function FileUploader({ onFileUpload, onFileStatusChange, multiple = false }: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  // Notify parent about file status changes
  useEffect(() => {
    if (onFileStatusChange) {
      onFileStatusChange({
        hasUnuploadedFile: files.length > 0 && status !== 'success',
        isUploading: status === 'uploading'
      });
    }
  }, [files, status, onFileStatusChange]);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'application/pdf'
      ];

      const validFiles = selectedFiles.filter((file) => allowedTypes.includes(file.type));

      if (validFiles.length === 0) {
        setFiles([]);
        setStatus('error');
        setErrorMessage('❌ File type not supported. Only JPG, PNG, WEBP, GIF, and PDF are allowed.');
        return;
      }

      if (validFiles.length < selectedFiles.length) {
        setErrorMessage('⚠️ Some files were skipped due to unsupported types.');
      } else {
        setErrorMessage(null);
      }

      setFiles(multiple ? validFiles : [validFiles[0]]);
      setStatus('idle');
      setCurrentFileIndex(0);
    }
  }

  async function handleFileUpload() {
    if (!files.length) return;

    setStatus('uploading');
    setUploadProgress(0);
    setErrorMessage(null);

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      setCurrentFileIndex(index);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload', true);
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

      const uploadPromise = new Promise<void>((resolve, reject) => {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded * 100) / event.total);
            setUploadProgress(progress);
          }
        };

        xhr.onload = function () {
          if (xhr.status === 200) {
            try {
              const response: UploadResponse = JSON.parse(xhr.responseText);
              onFileUpload(response.link);
              resolve();
            } catch (error) {
              console.error('Error parsing response:', error);
              reject(new Error('❌ Failed to parse upload response.'));
            }
          } else {
            console.error('Upload failed:', xhr.statusText);
            try {
              const response = JSON.parse(xhr.responseText);
              reject(new Error(`❌ ${response.error}`));
            } catch {
              reject(new Error('❌ Failed to upload file.'));
            }
          }
        };

        xhr.onerror = function () {
          console.error('Error uploading file');
          reject(new Error('❌ Error uploading file.'));
        };

        xhr.send(formData);
      });

      try {
        await uploadPromise;
      } catch (error) {
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : '❌ Failed to upload file.');
        return;
      }
    }

    setStatus('success');
  }

  return (
    <div className="space-y-4">
      {/* Custom file input label */}
      <label className="flex flex-col items-center px-8 py-4 bg-white text-blue-600 rounded-lg border-2 border-dashed border-blue-300 cursor-pointer hover:bg-blue-50 transition-colors">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-5 h-5"
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
          />
        </svg>
        <span className="text-sm font-medium">{multiple ? 'Choose files' : 'Choose file'}</span>
        <input 
          type="file" 
          onChange={handleFileChange} 
          className="hidden"
          multiple={multiple}
        />
      </label>

      {files.length > 0 && (
        <div className="mb-4 text-sm text-gray-300 space-y-1">
          {files.map((file) => (
            <p key={`${file.name}-${file.size}`}>
              {file.name} {(file.size / 1024).toFixed(2)} KB
            </p>
          ))}
        </div>
      )}

      {/* Warning message when file is selected but not uploaded */}
      {files.length > 0 && status === 'idle' && (
        <div className="p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          <p className="text-sm">⚠️ Please upload the selected file{files.length > 1 ? 's' : ''} before submitting the form.</p>
        </div>
      )}

      {/* Upload Progress Section */}
      {status === 'uploading' && (
        <div className="space-y-2">
          <div className="h-2.5 w-full rounded-full bg-gray-200">
            <div
              className="h-2.5 rounded-full bg-blue-300 transition-all"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-300 text-center">
            {multiple && files.length > 1
              ? `Uploading ${currentFileIndex + 1} of ${files.length} (${uploadProgress}%)`
              : `${uploadProgress}% uploaded`}
          </p>
        </div>
      )}

      {/* Upload button */}
      {files.length > 0 && status !== 'uploading' && status !== 'success' && (
        <button
          onClick={handleFileUpload}
          className="w-full px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {multiple ? 'Upload Files' : 'Upload File'}
        </button>
      )}

      {status === 'success' && (
        <p className="text-sm text-green-500">✅ File uploaded successfully!</p>
      )}

      {status === 'error' && errorMessage && (
        <p className="text-sm text-red-300">{errorMessage}</p>
      )}
    </div>
  );
}
