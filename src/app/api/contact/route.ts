import { NextResponse } from 'next/server';
import { db } from '@/db';
import { siteContent } from '@/db/schema';
import { eq } from 'drizzle-orm';
export async function POST(req: Request) { const b = await req.json(); const key = `enquiry:${Date.now()}`; await db.insert(siteContent).values({ key, title: b.name || 'Website enquiry', body: JSON.stringify({ ...b, source: 'website', createdAt: new Date().toISOString() }) }); return NextResponse.json({ ok: true }); }
export async function GET() { return NextResponse.json({ email: 'elushadetimothy@gmail.com', whatsapp: '+2347066510205', coverage: 'Nationwide' }); }
