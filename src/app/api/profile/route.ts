import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { users, candidateProfiles, businessProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const [u] = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
  if (!u) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  let profile: any = { userId: u.id, email: u.email, name: u.name, role: u.role, onboardingComplete: u.onboardingComplete };
  if (u.role === 'candidate') {
    const [p] = await db.select().from(candidateProfiles).where(eq(candidateProfiles.userId, u.id)).limit(1); profile = { ...profile, ...p };
  } else if (u.role === 'business') {
    const [p] = await db.select().from(businessProfiles).where(eq(businessProfiles.userId, u.id)).limit(1); profile = { ...profile, ...p };
  }
  return NextResponse.json({ profile });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const b = await req.json();
  const role = b.role === 'hotel' ? 'business' : (b.role === 'candidate' || b.role === 'business' ? b.role : undefined);
  await db.update(users).set({ name: b.name || session.user.name, role: role ?? undefined, onboardingComplete: Boolean(b.name && b.phone && b.country && b.region && b.city && role), updatedAt: new Date() }).where(eq(users.id, session.user.id));
  if (role === 'candidate') {
    await db.insert(candidateProfiles).values({ userId: session.user.id, country: b.country, region: b.region, city: b.city, bio: b.phone ? `Phone: ${b.phone}` : null, onboardingStep: 1 }).onConflictDoUpdate({ target: candidateProfiles.userId, set: { country: b.country, region: b.region, city: b.city, bio: b.phone ? `Phone: ${b.phone}` : undefined, updatedAt: new Date() } });
  }
  if (role === 'business') {
    await db.insert(businessProfiles).values({ userId: session.user.id, orgName: b.name, businessType: b.role === 'hotel' ? 'Hospitality' : undefined, country: b.country, region: b.region, city: b.city, contactName: b.name, contactPhone: b.phone, onboardingStep: 1 }).onConflictDoUpdate({ target: businessProfiles.userId, set: { orgName: b.name, country: b.country, region: b.region, city: b.city, contactName: b.name, contactPhone: b.phone, updatedAt: new Date() } });
  }
  return NextResponse.json({ ok: true });
}

export async function POST() { return GET(); }
