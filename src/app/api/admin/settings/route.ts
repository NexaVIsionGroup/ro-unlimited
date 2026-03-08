import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

const readClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'ndwy9k1c',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_READ_TOKEN,
  useCdn: false,
});

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'ndwy9k1c',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_EDIT_TOKEN,
  useCdn: false,
});

export async function GET() {
  try {
    const settings = await readClient.fetch(
      `*[_type == "siteSettings" && _id == "siteSettings"][0]{
        "heroVideoUrl": heroVideo.asset->url,
        "heroVideoId": heroVideo.asset->_id,
        heroOverlayOpacity,
        heroHeadline,
        heroSubheadline
      }`
    );
    return NextResponse.json(settings || {});
  } catch (error: any) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({});
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // If heroVideo is explicitly null, remove it
    if (body.heroVideo === null) {
      await writeClient.patch('siteSettings').unset(['heroVideo']).commit();
      return NextResponse.json({ success: true });
    }

    // Otherwise merge updates
    await writeClient.createOrReplace({
      _id: 'siteSettings',
      _type: 'siteSettings',
      ...body,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { error: error.message || 'Update failed' },
      { status: 500 }
    );
  }
}
