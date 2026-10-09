export const dynamic = "force-dynamic";

/**
 * Render liveness probe.
 * Keep this endpoint dependency-free so a healthy Node process is not marked
 * unhealthy just because an external dependency (for example Postgres) is
 * temporarily unavailable.
 */
export async function GET() {
  return Response.json({ ok: true, service: "stewardbridge", timestamp: new Date().toISOString() }, { status: 200 });
}
