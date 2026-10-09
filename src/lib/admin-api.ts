import { auth } from '@/lib/auth';
export async function requireAdmin() { const s=await auth(); if(!s?.user?.id || s.user.role!=='admin' || s.user.isAdminAuthorized===false) throw new Response('Forbidden',{status:403}); return s.user; }
