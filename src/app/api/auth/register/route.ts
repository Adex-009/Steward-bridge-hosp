import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/password";

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please provide a valid name, email and a password of at least 8 characters." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists. Please sign in instead." }, { status: 409 });
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const isAdminEmail = email === process.env.ADMIN_EMAIL?.toLowerCase();

  await db.insert(users).values({
    email,
    name: parsed.data.name,
    passwordHash,
    role: isAdminEmail ? "admin" : null,
    isAdminAuthorized: isAdminEmail,
  });

  return NextResponse.json({ ok: true });
}
