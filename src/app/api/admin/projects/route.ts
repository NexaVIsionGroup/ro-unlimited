/**
 * ============================================================
 * PROJECT MASTER FILE API
 * ============================================================
 * Sanity document type: "project"
 *
 * Schema fields (managed via API, no sanity.config needed):
 *   Core:        title, slug, division, status, order
 *   Details:     address, city, state, startDate, completionDate,
 *                scopeDescription, estimatedValue, sqft, notes
 *   Vendors:     vendors[] { name, trade, contact, phone, email, notes, cost }
 *   Files:       files[] { assetId, url, filename, mimeType, size,
 *                          category, uploadedAt, provider }
 *   Publish:     publishedToSite, siteData { publicTitle, publicDescription,
 *                heroAssetId, heroUrl, selectedMedia[], displayOrder[] }
 *
 * STORAGE PROVIDER NOTE:
 *   files[].provider = "sanity" | "b2"
 *   When migrating to B2, new uploads will have provider="b2"
 *   Old sanity assets remain valid — no migration needed for existing files
 *
 * DOMAIN TRANSFER:
 *   No changes needed in this file.
 *   Update NEXT_PUBLIC_SITE_URL in Vercel env vars only.
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { sanityClient, sanityWriteClient } from '@/lib/sanity/client';

// ── GET — list all projects OR single project ──────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    // Single project detail
    if (id) {
      const project = await sanityClient.fetch(
        `*[_type == "project" && _id == $id][0]{
          _id, title, slug, division, status, order,
          address, city, state, startDate, completionDate,
          scopeDescription, estimatedValue, sqft, notes,
          vendors,
          files,
          publishedToSite,
          siteData
        }`,
        { id }
      );
      if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      return NextResponse.json(project);
    }

    // All projects list
    const projects = await sanityClient.fetch(
      `*[_type == "project"] | order(order asc) {
        _id, title, division, status, order,
        city, state, startDate, completionDate,
        publishedToSite,
        "photoCount": count(files[category == "photo"]),
        "docCount": count(files[category in ["permit","contract","receipt","drawing","document"]]),
        "heroUrl": siteData.heroUrl
      }`
    );
    return NextResponse.json(projects || []);
  } catch (error: any) {
    console.error('Projects GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── POST — create new project ──────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, division, address, city, state, startDate, scopeDescription, estimatedValue } = body;

    if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 });

    // Generate slug from title
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const doc = await sanityWriteClient.create({
      _type: 'project',
      title: title.trim(),
      slug: { current: `${slug}-${Date.now()}` },
      division: division || 'residential',
      status: 'active',
      address: address || '',
      city: city || '',
      state: state || 'SC',
      startDate: startDate || null,
      completionDate: null,
      scopeDescription: scopeDescription || '',
      estimatedValue: estimatedValue || '',
      sqft: '',
      notes: '',
      vendors: [],
      files: [],
      publishedToSite: false,
      siteData: {
        publicTitle: title.trim(),
        publicDescription: '',
        heroAssetId: '',
        heroUrl: '',
        selectedMedia: [],
        displayOrder: [],
      },
      order: Date.now(),
    });

    return NextResponse.json({ success: true, id: doc._id });
  } catch (error: any) {
    console.error('Projects POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── PATCH — update any project field(s) ───────────────────────────────────

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ error: 'Project ID required' }, { status: 400 });

    await sanityWriteClient.patch(id).set(updates).commit();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Projects PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── DELETE — remove project ────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Project ID required' }, { status: 400 });

    // Note: Files stored in Sanity Assets remain — orphaned assets are cleaned
    // up periodically via sanity.io/manage > Assets. When on B2, we will need
    // to explicitly delete each file from B2 before deleting the project doc.
    await sanityWriteClient.delete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Projects DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
