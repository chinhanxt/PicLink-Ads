import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const PYTHON_SCRIPT = path.join(process.cwd(), 'python_services', 'image_processor.py');

export async function POST(request: NextRequest) {
  let tempInputPath: string | null = null;
  try {
    const contentType = request.headers.get('content-type') || '';
    let imageBuffer: Buffer | null = null;
    let ctaType = 'none';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const urlParam = formData.get('imageUrl') as string | null;
      ctaType = (formData.get('ctaType') as string) || 'none';

      if (file && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
      } else if (urlParam) {
        if (urlParam.startsWith('http://') || urlParam.startsWith('https://')) {
          const res = await fetch(urlParam);
          if (!res.ok) throw new Error(`Failed to fetch image from URL: ${res.statusText}`);
          const arrayBuffer = await res.arrayBuffer();
          imageBuffer = Buffer.from(arrayBuffer);
        } else if (urlParam.startsWith('/uploads/')) {
          const localPath = path.join(process.cwd(), 'public', urlParam);
          if (fs.existsSync(localPath)) {
            imageBuffer = fs.readFileSync(localPath);
          }
        }
      }
    } else {
      const body = await request.json();
      ctaType = body.ctaType || 'none';
      if (body.imageUrl) {
        if (body.imageUrl.startsWith('http://') || body.imageUrl.startsWith('https://')) {
          const res = await fetch(body.imageUrl);
          if (!res.ok) throw new Error(`Failed to fetch image from URL: ${res.statusText}`);
          const arrayBuffer = await res.arrayBuffer();
          imageBuffer = Buffer.from(arrayBuffer);
        } else if (body.imageUrl.startsWith('/uploads/')) {
          const localPath = path.join(process.cwd(), 'public', body.imageUrl);
          if (fs.existsSync(localPath)) {
            imageBuffer = fs.readFileSync(localPath);
          }
        }
      }
    }

    if (!imageBuffer) {
      return NextResponse.json({ success: false, error: 'No image file or valid imageUrl provided' }, { status: 400 });
    }

    // Ensure uploads directory exists
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    tempInputPath = path.join(UPLOADS_DIR, `temp_${uniqueId}.tmp`);
    const outputFilename = `${uniqueId}.jpg`;
    const outputPath = path.join(UPLOADS_DIR, outputFilename);

    fs.writeFileSync(tempInputPath, imageBuffer);

    // Call python image processor script with fallback if python execution fails
    try {
      await execFileAsync('python3', [PYTHON_SCRIPT, tempInputPath, outputPath, ctaType]);
    } catch (pyError) {
      console.warn('Python image processor failed, falling back to raw upload:', pyError);
      fs.copyFileSync(tempInputPath, outputPath);
    }

    // Return relative public path
    return NextResponse.json({
      success: true,
      imageUrl: `/uploads/${outputFilename}`,
    });
  } catch (error: any) {
    console.error('Error processing upload:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Image processing failed' },
      { status: 500 }
    );
  } finally {
    if (tempInputPath && fs.existsSync(tempInputPath)) {
      try {
        fs.unlinkSync(tempInputPath);
      } catch (e) {
        // ignore cleanup error
      }
    }
  }
}
