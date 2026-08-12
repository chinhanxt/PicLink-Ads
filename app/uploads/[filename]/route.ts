import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import os from 'os';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    // Prevent directory traversal attacks
    const sanitizedFilename = path.basename(filename);
    const primaryPath = path.join(process.cwd(), 'public', 'uploads', sanitizedFilename);
    const tmpPath = path.join(os.tmpdir(), 'uploads', sanitizedFilename);

    let filePath = primaryPath;
    if (!fs.existsSync(filePath)) {
      filePath = tmpPath;
    }

    if (!fs.existsSync(filePath)) {
      return new NextResponse('File Not Found', { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    // Determine content type based on extension
    const ext = path.extname(sanitizedFilename).toLowerCase();
    let contentType = 'image/jpeg';
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.gif') contentType = 'image/gif';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving upload file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
