import { NextRequest, NextResponse } from 'next/server';
import { sanityWriteClient } from '@/lib/sanity/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, trade, yearsExperience, licensed, insured, serviceArea, specialty, phone, email, portfolioLink } = body;

    if (!name || !trade || !phone) {
      return NextResponse.json({ error: 'Name, trade, and phone are required.' }, { status: 400 });
    }

    const doc = {
      _type: 'tradeApplication',
      name,
      trade,
      yearsExperience: yearsExperience || '',
      licensed: licensed === true || licensed === 'true',
      insured: insured === true || insured === 'true',
      serviceArea: serviceArea || '',
      specialty: specialty || '',
      phone,
      email: email || '',
      portfolioLink: portfolioLink || '',
      status: 'new',
      notes: '',
      submittedAt: new Date().toISOString(),
    };

    const result = await sanityWriteClient.create(doc);
    return NextResponse.json({ success: true, id: result._id });
  } catch (error: any) {
    console.error('Trade application error:', error);
    return NextResponse.json({ error: error.message || 'Submission failed' }, { status: 500 });
  }
}
