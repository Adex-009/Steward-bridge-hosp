import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { documents, candidateProfiles, businessProfiles, jobs, applications } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getDocument } from "@/lib/storage";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [doc] = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const user = session.user;
  let allowed = doc.userId === user.id || user.role === "admin";

  if (!allowed && user.role === "business") {
    const [business] = await db.select().from(businessProfiles).where(eq(businessProfiles.userId, user.id)).limit(1);
    const [candidate] = await db.select().from(candidateProfiles).where(eq(candidateProfiles.userId, doc.userId)).limit(1);
    if (business && candidate) {
      const rows = await db
        .select({ id: applications.id })
        .from(applications)
        .innerJoin(jobs, eq(jobs.id, applications.jobId))
        .where(and(eq(applications.candidateId, candidate.id), eq(jobs.businessId, business.id)));
      allowed = rows.length > 0;
    }
  }

  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const object = await getDocument(doc.storagePath);
    if (!object?.body) return NextResponse.json({ error: "File unavailable" }, { status: 404 });
    return new NextResponse(object.body, {
      headers: {
        "content-type": doc.fileType ?? object.httpMetadata?.contentType ?? "application/octet-stream",
        "content-disposition": `inline; filename="${doc.fileName.replace(/["\\]/g, "_")}"`,
        "cache-control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "File unavailable" }, { status: 404 });
  }
}
