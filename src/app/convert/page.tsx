"use client";

import { useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';

export default function Convert() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    setSelectedFiles(imageFiles);
    setError(null);
    setProgress(0);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    setSelectedFiles(prev => [...prev, ...imageFiles]);
    setError(null);
  }, []);

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleConversion = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one image');
      return;
    }

    setConverting(true);
    setError(null);
    setProgress(0);

    try {
      const pdfDoc = await PDFDocument.create();

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const arrayBuffer = await file.arrayBuffer();

        // Use canvas to convert any image format to PNG/JPEG bytes
        const imageBytes = await convertImageToBytes(arrayBuffer, file.type);

        let embeddedImage;
        // pdf-lib supports JPEG and PNG natively
        if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
          try {
            embeddedImage = await pdfDoc.embedJpg(imageBytes);
          } catch {
            // fallback: re-encode via canvas
            const pngBytes = await convertToPngViaCanvas(arrayBuffer);
            embeddedImage = await pdfDoc.embedPng(pngBytes);
          }
        } else {
          // PNG, GIF, BMP, WEBP → convert to PNG via canvas
          const pngBytes = await convertToPngViaCanvas(arrayBuffer);
          embeddedImage = await pdfDoc.embedPng(pngBytes);
        }

        const { width, height } = embeddedImage;
        const page = pdfDoc.addPage([width, height]);
        page.drawImage(embeddedImage, { x: 0, y: 0, width, height });

        setProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'converted.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setProgress(100);
    } catch (err) {
      console.error(err);
      setError('Failed to convert images to PDF. Please try again.');
    } finally {
      setConverting(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Image to PDF Converter</h1>
          <p className="text-lg text-gray-600">Convert your images to PDF instantly — no upload needed, all done in your browser</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer inline-flex flex-col items-center">
              <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-600 mb-2 text-lg font-medium">
                Drag & drop images here, or click to browse
              </span>
              <span className="text-sm text-gray-500">
                Supports: JPG, PNG, GIF, BMP, WEBP
              </span>
            </label>
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Selected Images ({selectedFiles.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                    <p className="text-sm text-gray-600 mt-1 truncate">{file.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          {converting && progress > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Converting...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <button
            onClick={handleConversion}
            disabled={converting || selectedFiles.length === 0}
            className={`mt-6 w-full py-3 px-6 rounded-lg text-white font-medium transition-colors
              ${converting || selectedFiles.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              }`}
          >
            {converting ? `Converting... ${progress}%` : 'Convert to PDF'}
          </button>
        </div>
      </div>
    </main>
  );
}

// Convert any image arrayBuffer to PNG bytes using canvas
async function convertToPngViaCanvas(arrayBuffer: ArrayBuffer): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([arrayBuffer]);
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not supported')); return; }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((pngBlob) => {
        URL.revokeObjectURL(url);
        if (!pngBlob) { reject(new Error('Failed to convert image')); return; }
        pngBlob.arrayBuffer().then(buf => resolve(new Uint8Array(buf))).catch(reject);
      }, 'image/png');
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
    img.src = url;
  });
}

// Returns the raw bytes from an arrayBuffer
async function convertImageToBytes(arrayBuffer: ArrayBuffer, _mimeType: string): Promise<Uint8Array> {
  return new Uint8Array(arrayBuffer);
}
