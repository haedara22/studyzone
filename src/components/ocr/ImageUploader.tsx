'use client';

import React, { useState, useRef } from 'react';
import { Upload, RefreshCw, CheckCircle2 } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (base64OrFile: string) => void;
  isLoading: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, isLoading }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار صورة صالحة (PNG, JPG, WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      onImageSelected(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* منطقة السحب والإسقاط */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center min-h-[220px] ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/80 scale-[1.01]'
            : preview
            ? 'border-emerald-300 bg-emerald-50/30 hover:bg-emerald-50/50'
            : 'border-slate-300 hover:border-indigo-400 bg-slate-50/60 hover:bg-slate-100/60'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
          accept="image/*"
          className="hidden"
        />

        {preview ? (
          <div className="relative w-full flex flex-col items-center">
            <img
              src={preview}
              alt="معاينة الوثيقة"
              className="max-h-56 rounded-xl object-contain shadow-sm mb-3 border border-slate-200 bg-white p-1"
            />
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> تم تحميل الصورة بنجاح. انقر للتغيير
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <div className="p-4 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs md:text-sm font-bold text-slate-800">
                اسحب الصورة وأسقطها هنا، أو <span className="text-indigo-600 underline">انقر للتصفح</span>
              </p>
              <p className="text-[11px] text-slate-500 font-medium mt-1">يدعم كتب البكالوريا، الملاحظات اليدوية والصور (PNG, JPG, WEBP)</p>
            </div>
          </div>
        )}

        {/* طبقة التحميل (Loading Overlay) */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center gap-3 border border-slate-200">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-xs font-bold text-slate-700">جاري المعالجة واستخراج النصوص بالذكاء الاصطناعي...</p>
          </div>
        )}
      </div>
    </div>
  );
};