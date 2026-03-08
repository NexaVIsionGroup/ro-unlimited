import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'ndwy9k1c',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_EDIT_TOKEN,
  useCdn: false,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert File to Buffer for Sanity upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload asset to Sanity
    const asset = await client.assets.upload('file', buffer, {
      filename: file.name,
      contentType: file.type,
    });

    // If this is a hero video, update the siteSettings document
    if (type === 'heroVideo') {
      await client.createOrReplace({
        _id: 'siteSettings',
        _type: 'siteSettings',
        heroVideo: {
          _type: 'file',
          asset: {
            _type: 'reference',
            _ref: asset._id,
          },
        },
      });
    }

    return NextResponse.json({
      url: asset.url,
      assetId: asset._id,
      originalFilename: asset.originalFilename,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
