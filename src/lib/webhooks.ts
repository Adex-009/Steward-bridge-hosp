import { db } from "@/db";
import { webhookEvents, webhookEndpoints } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

export type WebhookEventType =
  | "job.created"
  | "job.updated"
  | "job.published"
  | "job.paused"
  | "job.closed"
  | "application.created"
  | "application.updated"
  | "candidate.updated"
  | "business.updated"
  | "staffing_request.created"
  | "staffing_request.updated"
  | "document.uploaded"
  | "message.created"
  | "deployment.created"
  | "feedback.created"
  | "rating.created"
  | "calendar_event.created";

/**
 * Records a structured platform event and attempts delivery to the external
 * StewardBridge AI agent, if a webhook URL is configured. The core website
 * never depends on this succeeding — events are always durably recorded first.
 */
export async function emitWebhookEvent(
  eventType: WebhookEventType,
  payload: Record<string, unknown>,
  record?: { type: string; id: string },
) {
  const [row] = await db
    .insert(webhookEvents)
    .values({
      eventType,
      recordType: record?.type ?? null,
      recordId: record?.id ?? null,
      payload: {
        eventId: crypto.randomUUID(),
        eventType,
        timestamp: new Date().toISOString(),
        ...payload,
      },
      status: "pending",
    })
    .returning();

  const [activeEndpoint] = await db
    .select()
    .from(webhookEndpoints)
    .where(and(eq(webhookEndpoints.isActive, true)))
    .limit(1);

  const target = activeEndpoint?.url ?? process.env.EXTERNAL_AGENT_WEBHOOK_URL;
  if (!target) {
    // No external agent configured — event stays recorded as pending for later delivery.
    return row;
  }

  try {
    const secret = activeEndpoint?.secret ?? process.env.WEBHOOK_SIGNING_SECRET ?? "";
    const body = JSON.stringify(row.payload);
    const signature = crypto.createHmac("sha256", secret).update(body).digest("hex");

    const res = await fetch(target, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-stewardbridge-signature": signature,
        "x-stewardbridge-event": eventType,
      },
      body,
      signal: AbortSignal.timeout(5000),
    });

    const text = await res.text().catch(() => "");
    await db
      .update(webhookEvents)
      .set({
        status: res.ok ? "delivered" : "failed",
        attempts: 1,
        lastAttemptAt: new Date(),
        responseSnippet: text.slice(0, 500),
      })
      .where(eq(webhookEvents.id, row.id));
  } catch (err) {
    await db
      .update(webhookEvents)
      .set({
        status: "failed",
        attempts: 1,
        lastAttemptAt: new Date(),
        responseSnippet: err instanceof Error ? err.message.slice(0, 500) : "delivery failed",
      })
      .where(eq(webhookEvents.id, row.id));
  }

  return row;
}
