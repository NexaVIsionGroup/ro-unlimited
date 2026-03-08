'use client';

import { useState, useRef, useCallback } from 'react';
import { X, Upload, Loader2, Check, FileVideo, FileImage } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  accept: string;
  type: 'video' | 'image';
  onUploadComplete?: (data: { assetId: string; url: string; filename: string }) => void;
}

export default function UploadModal({ isOpen, onClose, title, description, accept, type, onUploadComplete }: UploadModalProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    setProgress(0);
    setError('');
    setDone(false);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 3, 90));
    }, 400);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();

      clearInterval(progressInterval);

      if (data.error) throw new Error(data.error);

      setProgress(100);
      setDone(true);
      onUploadComplete?.({ assetId: data.assetId, url: data.url, filename: data.originalFilename || file.name });

      setTimeout(() => {
        onClose();
        setDone(false);
        setProgress(0);
      }, 1500);
    } catch (e: any) {
      clearInterval(progressInterval);
      setError(e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [type, onUploadComplete, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111] border border-white/10 rounded-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h2 className="text-base font-semibold">{title}</h2>
            <p className="text-xs text-white/30 mt-0.5">{description}</p>
          </div>
          <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Upload zone */}
        <div className="p-6">
          <div
            className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${
              dragOver ? 'border-[#C9A84C] bg-[#C9A84C]/5' :
              done ? 'border-green-500/30 bg-green-500/5' :
              error ? 'border-red-500/30 bg-red-500/5' :
              'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
            } ${uploading ? 'pointer-events-none' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files[0];
              if (file) handleUpload(file);
            }}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
                e.target.value = '';
              }}
            />

            {done ? (
              <div>
                <div className="w-12 h-12 mx-auto mb-3 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Check size={24} className="text-green-400" />
                </div>
                <p className="text-green-400 text-sm font-medium">Uploaded!</p>
              </div>
            ) : uploading ? (
              <div>
                <Loader2 size={32} className="mx-auto mb-3 animate-spin text-[#C9A84C]" />
                <p className="text-white/60 text-sm mb-3">Uploading...</p>
                <div className="w-48 mx-auto h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#C9A84C] rounded-full transition-all duration-300" style={{ width: progress + '%' }} />
                </div>
                <p className="text-[10px] text-white/20 mt-2">{progress}%</p>
              </div>
            ) : error ? (
              <div>
                <X size={32} className="mx-auto mb-3 text-red-400" />
                <p className="text-red-400 text-sm mb-1">Upload failed</p>
                <p className="text-red-400/60 text-xs">{error}</p>
                <p className="text-white/20 text-xs mt-3">Click to try again</p>
              </div>
            ) : (
              <div>
                {type === 'video' ? (
                  <FileVideo size={32} className="mx-auto mb-3 text-white/15" />
                ) : (
                  <FileImage size={32} className="mx-auto mb-3 text-white/15" />
                )}
                <p className="text-white/60 text-sm mb-1">Drag & drop or click to browse</p>
                <p className="text-white/20 text-xs">{accept.replace(/,/g, ', ')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
