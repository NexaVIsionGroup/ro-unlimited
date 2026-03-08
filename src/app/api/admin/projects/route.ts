import { NextRequest, NextResponse } from 'next/server';
import { sanityClient, sanityWriteClient } from '@/lib/sanity/client';

export async function GET() {
  try {
    const projects = await sanityClient.fetch(
      `*[_type == "project"] | order(order asc) {
        _id,
        title,
        division,
        description,
        order,
        "photos": photos[]{
          "url": asset->url,
          "assetId": asset._ref,
          alt,
          caption
        }
      }`
    );
    return NextResponse.json(projects || []);
  } catch (error: any) {
    console.error('Projects fetch error:', error);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, division, description, photos } = body;

    const doc = await sanityWriteClient.create({
      _type: 'project',
      title,
      division,
      description,
      photos: photos || [],
      order: Date.now(),
    });

    return NextResponse.json({ success: true, id: doc._id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ error: 'No project ID' }, { status: 400 });

    await sanityWriteClient.patch(id).set(updates).commit();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'No project ID' }, { status: 400 });

    await sanityWriteClient.delete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
