import { NextResponse } from 'next/server';
import { db } from '@/db';
import { jobs, businessProfiles } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET() {
  const rows = await db.select({ job: jobs, business: businessProfiles }).from(jobs).leftJoin(businessProfiles, eq(jobs.businessId, businessProfiles.id)).where(eq(jobs.status, 'published')).orderBy(desc(jobs.createdAt));
  return NextResponse.json({ jobs: rows.map(({ job, business }) => ({ ...job, title: job.title, location: [job.city, job.region, job.country].filter(Boolean).join(', ') || 'Nationwide', workType: job.workType, openings: 1, description: job.description || '', requirements: job.requirements || '', businessName: business?.orgName || 'StewardBridge partner' })) });
}

export async function POST(req: Request) {
  const session = await auth(); if (!session?.user?.id || session.user.role !== 'business') return NextResponse.json({ error: 'Business authorization required' }, { status: 403 });
  const b = await req.json();
  const [bp] = await db.select().from(businessProfiles).where(eq(businessProfiles.userId, session.user.id)).limit(1);
  if (!bp) return NextResponse.json({ error: 'Business profile required' }, { status: 400 });
  const [job] = await db.insert(jobs).values({ businessId: bp.id, title: String(b.title || 'Untitled'), category: String(b.category || 'General'), description: String(b.description || ''), requirements: String(b.requirements || ''), skills: [], workType: String(b.workType || 'Full-time'), country: String(b.country || 'Nigeria'), region: String(b.region || ''), city: String(b.location || b.city || 'Nationwide'), status: 'published', publishedAt: new Date() }).returning();
  return NextResponse.json({ ok: true, id: job.id });
}
