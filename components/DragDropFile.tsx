import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from "@/components/ui/progress";

interface DragDropFileProps {
  onFileSelect: (files: File[]) => void;
  onConvert: (files: File[]) => Promise<Blob>;
}

export function DragDropFile({ onFileSelect, onConvert }: DragDropFileProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [convertingProgress, setConvertingProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...files, ...acceptedFiles];
    setFiles(newFiles);
    onFileSelect(newFiles);

    const newPreviews = acceptedFiles.map(file => {
      if (file.type.startsWith('image/')) {
        return URL.createObjectURL(file);
      }
      return '';
    });
    setPreviews([...previews, ...newPreviews]);
  }, [files, previews, onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp'],
    },
    maxFiles: 10,
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    URL.revokeObjectURL(previews[index]);
    
    setFiles(newFiles);
    setPreviews(newPreviews);
    onFileSelect(newFiles);
  };

  useEffect(() => {
    return () => {
      previews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [previews]);

  const handleConversion = async () => {
    if (!files.length) return;

    try {
      setIsConverting(true);
      
      toast.loading('Converting files...', {
        duration: Infinity,
        id: 'conversion-toast'
      });

      const progressInterval = setInterval(() => {
        setConvertingProgress(prev => {
          if (prev >= 90) clearInterval(progressInterval);
          return Math.min(prev + 10, 90);
        });
      }, 500);

      const pdfBlob = await onConvert(files);
      
      clearInterval(progressInterval);
      setConvertingProgress(100);
      
      // Download the PDF
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'converted-images.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.dismiss('conversion-toast');
      toast.success('Conversion complete! Your download has started.');
      
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error('Error converting files. Please try again.');
    } finally {
      setIsConverting(false);
      setConvertingProgress(0);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div
        {...getRootProps()}
        className={`p-6 sm:p-8 border-2 border-dashed rounded-xl cursor-pointer 
          transition-all duration-300 ease-in-out transform
          ${isDragActive 
            ? 'border-violet-500 bg-violet-50/50 dark:bg-violet-900/10 scale-[1.02] shadow-lg' 
            : 'border-gray-300 hover:border-violet-400 hover:bg-gray-50/50 dark:hover:bg-gray-800/10'}
          touch-manipulation relative
          ${isConverting ? 'pointer-events-none opacity-70' : ''}`}
      >
        <input {...getInputProps()} />
        
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-8 transition-transform duration-200">
            <Upload className={`w-12 h-12 transition-colors duration-200 ${
              isDragActive ? 'text-violet-500' : 'text-gray-400'
            }`} />
            {isDragActive ? (
              <p className="text-lg font-medium text-violet-500 animate-bounce">
                Drop your files here...
              </p>
            ) : (
              <>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
                  Drag & drop your files here
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  or click to select files
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Supports: Images (PNG, JPG, GIF, BMP)
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* Preview Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4">
              {files.map((file, index) => (
                <div 
                  key={`${file.name}-${index}`} 
                  className="relative group animate-fade-in"
                >
                  <div className="w-[80%] aspect-square mx-auto">
                    {file.type.startsWith('image/') ? (
                      <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-sm transition-transform duration-200 group-hover:scale-[1.02]">
                        <img
                          src={previews[index]}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <File className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 
                        bg-red-500 text-white rounded-full 
                        opacity-0 group-hover:opacity-100 
                        transition-all duration-200 ease-in-out
                        transform hover:scale-110
                        flex items-center justify-center
                        shadow-md"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-xs truncate max-w-[80px] mx-auto" 
                       title={file.name}>
                      {file.name.length > 12 
                        ? `${file.name.slice(0, 10)}...` 
                        : file.name}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Drop more files message */}
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              <span className="hidden sm:inline">Drop more files or click to add more</span>
              <span className="sm:hidden">Tap to add more files</span>
            </p>
          </div>
        )}
      </div>

      {/* Conversion Progress */}
      {isConverting && (
        <div className="space-y-2 animate-fade-in">
          <Progress value={convertingProgress} className="h-1.5" />
          <p className="text-sm text-center text-gray-600 dark:text-gray-400">
            Converting... {convertingProgress}%
          </p>
        </div>
      )}

      {/* Convert Button */}
      <button
        onClick={handleConversion}
        disabled={isConverting || !files.length}
        className="w-full py-4 text-sm font-medium text-white 
          bg-gradient-to-r from-violet-600 to-indigo-600 
          dark:from-violet-500 dark:to-indigo-500 
          hover:from-violet-700 hover:to-indigo-700 
          dark:hover:from-violet-600 dark:hover:to-indigo-600 
          disabled:opacity-50 disabled:cursor-not-allowed 
          rounded-xl transition-all duration-300 
          transform hover:scale-[0.99] hover:shadow-lg
          focus:outline-none focus:ring-2 focus:ring-violet-500/20"
      >
        {isConverting ? (
          <>
            <Loader2 className="inline w-4 h-4 mr-2 animate-spin" />
            Converting {files.length} {files.length === 1 ? 'Image' : 'Images'} to PDF
          </>
        ) : (
          files.length > 0 
            ? `Convert ${files.length} ${files.length === 1 ? 'Image' : 'Images'} to PDF`
            : 'Select images to convert to PDF'
        )}
      </button>
    </div>
  );
} 