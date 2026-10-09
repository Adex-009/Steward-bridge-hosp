import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { candidateProfiles, businessProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getSessionUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/auth/sign-in");
  return user;
}

export async function requireRole(role: "candidate" | "business" | "admin") {
  const user = await requireUser();
  if (user.role !== role) {
    if (user.role === "admin") redirect("/admin");
    else if (user.role === "business") redirect("/dashboard/business");
    else if (user.role === "candidate") redirect("/dashboard/candidate");
    else redirect("/onboarding/role");
  }
  return user;
}

export async function requireCandidateProfile() {
  const user = await requireRole("candidate");
  const [profile] = await db.select().from(candidateProfiles).where(eq(candidateProfiles.userId, user.id)).limit(1);
  if (!profile) redirect("/onboarding/candidate");
  return { user, profile };
}

export async function requireBusinessProfile() {
  const user = await requireRole("business");
  const [profile] = await db.select().from(businessProfiles).where(eq(businessProfiles.userId, user.id)).limit(1);
  if (!profile) redirect("/onboarding/business");
  return { user, profile };
}
