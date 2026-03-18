'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { PDFDocument } from 'pdf-lib'
import Navigation from '@/components/Navigation'

// A4 dimensions in points (1 point = 1/72 inch)
const A4_WIDTH = 595.28
const A4_HEIGHT = 841.89
const IMAGE_WIDTH = 500 // Fixed width for all images
const IMAGE_HEIGHT = 700 // Fixed height for all images

export default function Home() {
  const [files, setFiles] = useState<File[]>([])
  const [converting, setConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles.filter(file => file.type.startsWith('image/'))])
    setError(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    }
  })

  const handleConvert = async () => {
    if (files.length === 0) {
      setError('Please add at least one image')
      return
    }

    try {
      setConverting(true)
      setError(null)

      // Create PDF document
      const pdfDoc = await PDFDocument.create()
      
      // Set document metadata
      pdfDoc.setTitle('Powered By Shehzada')
      pdfDoc.setAuthor('Shehzada')
      pdfDoc.setSubject('Image to PDF Conversion')
      pdfDoc.setKeywords(['image', 'pdf', 'conversion'])

      for (const file of files) {
        try {
          const imageBytes = await file.arrayBuffer()
          let image
          
          if (file.type === 'image/png') {
            image = await pdfDoc.embedPng(imageBytes)
          } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
            image = await pdfDoc.embedJpg(imageBytes)
          } else {
            continue // Skip unsupported formats
          }

          // Create A4 page
          const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT])

          // Calculate scaling factor to fit image within fixed dimensions
          const imageWidth = image.width
          const imageHeight = image.height
          const widthRatio = IMAGE_WIDTH / imageWidth
          const heightRatio = IMAGE_HEIGHT / imageHeight
          const scale = Math.min(widthRatio, heightRatio)

          // Calculate final dimensions
          const finalWidth = imageWidth * scale
          const finalHeight = imageHeight * scale

          // Center the image on the page
          const x = (A4_WIDTH - finalWidth) / 2
          const y = (A4_HEIGHT - finalHeight) / 2

          // Draw the image
          page.drawImage(image, {
            x,
            y,
            width: finalWidth,
            height: finalHeight,
          })
        } catch (err) {
          console.error(`Error processing file ${file.name}:`, err)
          continue // Skip to next file if there's an error
        }
      }

      // Save and download PDF
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([Buffer.from(pdfBytes)], { type: 'application/pdf' })
      
      // Create download link with correct filename
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'Powered By Shehzada.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setFiles([])
    } catch (err) {
      setError('Error converting images to PDF. Please try again.')
      console.error('PDF conversion error:', err)
    } finally {
      setConverting(false)
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <main className="min-h-screen">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display mb-6">
              Convert Images to PDF
              <span className="text-orange-500"> Instantly</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-12">
              Drop your images below and we'll convert them into a professional PDF document in seconds.
              Supports PNG, JPG, and JPEG formats.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-orange-500 bg-orange-500/10' : 'border-gray-700 hover:border-orange-500/50'}`}
            >
              <input {...getInputProps()} />
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-lg text-gray-300">
                {isDragActive
                  ? "Drop your images here..."
                  : "Drag 'n' drop images here, or click to select files"}
              </p>
            </div>

            {files.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Selected Images ({files.length})</h3>
                <div className="space-y-3">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-accent-black p-4 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-300">{file.name}</span>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleConvert}
                  disabled={converting}
                  className="w-full mt-6 cta-button disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {converting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Converting...
                    </span>
                  ) : (
                    'Convert to PDF'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
} 