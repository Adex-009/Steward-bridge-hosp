import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, database: "reachable" }, { status: 200 });
  } catch {
    return Response.json({ ok: false, database: "unreachable" }, { status: 503 });
  }
}
