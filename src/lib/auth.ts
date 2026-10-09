import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/password";

const providers: NextAuthConfig["providers"] = [
  Credentials({
    id: "credentials",
    name: "Email and password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = (credentials?.email as string | undefined)?.toLowerCase().trim();
      const password = credentials?.password as string | undefined;
      if (!email || !password) return null;

      const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (!existing || !existing.passwordHash) return null;

      const valid = await verifyPassword(password, existing.passwordHash);
      if (!valid) return null;

      return {
        id: existing.id,
        email: existing.email,
        name: existing.name ?? undefined,
        image: existing.image ?? undefined,
      };
    },
  }),
];

const googleId = process.env.GOOGLE_CLIENT_ID;
const googleSecret = process.env.GOOGLE_CLIENT_SECRET;
if (googleId && googleSecret) {
  providers.push(
    Google({
      clientId: googleId,
      clientSecret: googleSecret,
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/sign-in",
  },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user?.email) {
        const email = user.email.toLowerCase();
        const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!existing) {
          const isAdminEmail = email === process.env.ADMIN_EMAIL?.toLowerCase();
          await db.insert(users).values({
            email,
            name: user.name ?? null,
            image: user.image ?? null,
            role: isAdminEmail ? "admin" : null,
            isAdminAuthorized: isAdminEmail,
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      const email = (user?.email ?? token.email)?.toLowerCase();
      if (email) {
        const [dbUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (dbUser) {
          token.uid = dbUser.id;
          token.role = dbUser.role;
          token.onboardingComplete = dbUser.onboardingComplete;
          token.isAdminAuthorized = dbUser.isAdminAuthorized;
          token.email = dbUser.email;
          token.name = dbUser.name ?? undefined;
          token.picture = dbUser.image ?? undefined;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.uid as string) ?? "";
        session.user.role = (token.role as "candidate" | "business" | "admin" | null) ?? null;
        session.user.onboardingComplete = Boolean(token.onboardingComplete);
        session.user.isAdminAuthorized = Boolean(token.isAdminAuthorized);
      }
      return session;
    },
  },
});

export const isGoogleAuthEnabled = Boolean(googleId && googleSecret);
