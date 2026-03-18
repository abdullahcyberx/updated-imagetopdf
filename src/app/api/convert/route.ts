import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const images = formData.getAll('images');

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      );
    }

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    // Process each image
    for (const image of images) {
      if (!(image instanceof File)) continue;

      // Read the image file
      const buffer = Buffer.from(await image.arrayBuffer());

      // Convert image to PNG format and resize if necessary
      const pngBuffer = await sharp(buffer)
        .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
        .png()
        .toBuffer();

      // Convert PNG to PDF page
      const pngImage = await pdfDoc.embedPng(pngBuffer);
      const page = pdfDoc.addPage();
      
      // Calculate dimensions to fit the image properly
      const { width, height } = page.getSize();
      const imgDims = pngImage.scale(1);
      const scale = Math.min(
        width / imgDims.width,
        height / imgDims.height
      );

      // Draw the image centered on the page
      page.drawImage(pngImage, {
        x: (width - imgDims.width * scale) / 2,
        y: (height - imgDims.height * scale) / 2,
        width: imgDims.width * scale,
        height: imgDims.height * scale,
      });
    }

    // Save the PDF
    const pdfBytes = await pdfDoc.save();

    // Return the PDF file
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=converted.pdf',
      },
    });
  } catch (error) {
    console.error('PDF conversion error:', error);
    return NextResponse.json(
      { error: 'Failed to convert images to PDF' },
      { status: 500 }
    );
  }
}
