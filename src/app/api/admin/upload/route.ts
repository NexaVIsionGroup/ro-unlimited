import { NextRequest, NextResponse } from 'next/server';
import { sanityWriteClient } from '@/lib/sanity/client';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log(`Uploading ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)...`);

    const buffer = Buffer.from(await file.arrayBuffer());
    const isVideo = type === 'heroVideo' || type === 'video' || file.type.startsWith('video/');

    const asset = await sanityWriteClient.assets.upload(
      isVideo ? 'file' : 'image',
      buffer,
      { filename: file.name, contentType: file.type }
    );

    // If this is a hero video upload, also link it to siteSettings
    if (type === 'heroVideo') {
      await sanityWriteClient.createIfNotExists({
        _id: 'siteSettings',
        _type: 'siteSettings',
      });

      await sanityWriteClient.patch('siteSettings').set({
        heroVideo: {
          _type: 'file',
          asset: { _type: 'reference', _ref: asset._id },
        },
      }).commit();
    }

    console.log(`Upload complete: ${asset._id}`);

    return NextResponse.json({
      assetId: asset._id,
      url: asset.url,
      originalFilename: asset.originalFilename,
      mimeType: asset.mimeType,
      size: asset.size,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
