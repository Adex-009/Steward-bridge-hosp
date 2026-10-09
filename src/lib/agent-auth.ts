import crypto from 'node:crypto';
export function requireAgent(req: Request) {
  const secret = process.env.WEBHOOK_SIGNING_SECRET || process.env.STEWARD_BRIDGE_AGENT_WEBHOOK_SECRET || '';
  const supplied = req.headers.get('authorization')?.replace(/^Bearer\s+/i,'') || req.headers.get('x-stewardbridge-agent-secret') || req.headers.get('x-agent-key') || req.headers.get('x-sb-secret') || '';
  if (!secret || !supplied || Buffer.byteLength(supplied) !== Buffer.byteLength(secret) || !crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(secret))) throw new Response('Unauthorized agent request',{status:401});
}
