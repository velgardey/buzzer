import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Music, Eye, Trash2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

interface MediaFile {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'video' | 'audio';
}

interface MediaUploaderProps {
  onUpload: (files: MediaFile[]) => void;
  onDelete: (fileId: string) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  maxSize?: number;
}

export default function MediaUploader({
  onUpload,
  onDelete,
  maxFiles = 10,
  acceptedTypes = ['image/*', 'video/*', 'audio/*'],
  maxSize = 10 * 1024 * 1024 // 10MB
}: MediaUploaderProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      id: `${file.name}-${Date.now()}`,
      file,
      preview: URL.createObjectURL(file),
      type: file.type.split('/')[0] as MediaFile['type']
    }));

    setFiles(prev => {
      const updated = [...prev, ...newFiles];
      onUpload(updated);
      return updated;
    });
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, curr) => ({ ...acc, [curr]: [] }), {}),
    maxSize,
    maxFiles: maxFiles - files.length
  });

  const handleDelete = (fileId: string) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      onDelete(fileId);
      if (previewFile?.id === fileId) {
        setPreviewFile(null);
      }
      return updated;
    });
  };

  const PreviewImage = ({ file }: { file: MediaFile }) => (
    <div className="relative w-full h-32">
      <Image
        src={file.preview}
        alt={file.file.name}
        fill
        className="object-cover rounded-lg"
        unoptimized={file.preview.startsWith('data:')}
      />
    </div>
  );

  const FilePreview = ({ file }: { file: MediaFile }) => {
    const isPreviewOpen = previewFile?.id === file.id;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="relative group"
      >
        <div className="relative">
          {file.type === 'image' ? (
            <PreviewImage file={file} />
          ) : file.type === 'video' ? (
            <video
              src={file.preview}
              className="w-full h-32 object-cover rounded-lg"
              controls={isPreviewOpen}
            />
          ) : (
            <audio
              src={file.preview}
              className="w-full mt-2"
              controls
            />
          )}
          <button
            onClick={() => handleDelete(file.id)}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full
                      hover:bg-red-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 
                      transition-opacity duration-300 rounded-lg flex items-center justify-center">
          <div className="flex gap-2">
            <button
              onClick={() => setPreviewFile(isPreviewOpen ? null : file)}
              className="p-2 bg-white rounded-full hover:bg-gray-100 
                       transition-colors duration-300"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(file.id)}
              className="p-2 bg-white rounded-full hover:bg-red-100 
                       transition-colors duration-300"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                   transition-colors duration-300 space-y-4
                   ${isDragActive 
                     ? 'border-purple-500 bg-purple-50' 
                     : 'border-gray-300 hover:border-gray-400'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <Upload className={`w-12 h-12 ${isDragActive ? 'text-purple-500' : 'text-gray-400'}`} />
          <p className="text-sm text-gray-600">
            {isDragActive
              ? 'Drop the files here...'
              : 'Drag & drop files here, or click to select files'}
          </p>
          <p className="text-xs text-gray-500">
            Maximum file size: {maxSize / (1024 * 1024)}MB
          </p>
        </div>
      </div>

      {/* File Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <AnimatePresence>
          {files.map(file => (
            <FilePreview key={file.id} file={file} />
          ))}
        </AnimatePresence>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8"
            onClick={() => setPreviewFile(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl w-full bg-white rounded-lg overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewFile(null)}
                className="absolute top-4 right-4 p-2 bg-white rounded-full 
                         hover:bg-gray-100 transition-colors duration-300 z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="aspect-video w-full">
                {previewFile.type === 'image' && (
                  <div className="relative w-full h-full">
                    <Image
                      src={previewFile.preview}
                      alt={previewFile.file.name}
                      fill
                      className="object-contain"
                      unoptimized={previewFile.preview.startsWith('data:')}
                    />
                    <button
                      onClick={() => handleDelete(previewFile.id)}
                      className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg
                               hover:bg-red-50 transition-colors"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                )}
                {previewFile.type === 'video' && (
                  <video
                    src={previewFile.preview}
                    className="w-full h-full"
                    controls
                    autoPlay
                  />
                )}
                {previewFile.type === 'audio' && (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                    <Music className="w-24 h-24 text-gray-400" />
                    <audio src={previewFile.preview} controls />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 