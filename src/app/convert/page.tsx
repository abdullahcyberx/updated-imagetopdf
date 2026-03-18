"use client";

import { useState } from 'react';
import Image from 'next/image';

export default function Convert() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    setSelectedFiles(imageFiles);
    setError(null);
  };

  const handleConversion = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one image');
      return;
    }

    setConverting(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Conversion failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'converted.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
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
          <p className="text-lg text-gray-600">Convert your images to PDF with just a few clicks</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-flex flex-col items-center"
            >
              <div className="mb-4">
                <Image
                  src="/upload.svg"
                  alt="Upload"
                  width={64}
                  height={64}
                  className="opacity-50"
                />
              </div>
              <span className="text-gray-600 mb-2">
                Drag and drop your images here, or click to browse
              </span>
              <span className="text-sm text-gray-500">
                Supports: JPG, PNG, GIF, BMP
              </span>
            </label>
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Selected Images ({selectedFiles.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative">
                    <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                    </div>
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

          <button
            onClick={handleConversion}
            disabled={converting || selectedFiles.length === 0}
            className={`mt-6 w-full py-3 px-6 rounded-lg text-white font-medium
              ${converting || selectedFiles.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {converting ? 'Converting...' : 'Convert to PDF'}
          </button>
        </div>
      </div>
    </main>
  );
}
