import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// ─── Developer / admin accounts ──────────────────────────────────────────────
// These emails always receive "scholar" tier regardless of what is stored in
// the database — gives full access to every feature without a paid plan.

const DEV_EMAILS = new Set([
  "arielkogan9@gmail.com",
  "dailydavar1@gmail.com",
]);

function resolvedTier(email: string, dbTier: string): string {
  return DEV_EMAILS.has(email.toLowerCase()) ? "scholar" : (dbTier ?? "free");
}

// ─── Auth config ──────────────────────────────────────────────────────────────

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const normalised = credentials.email.toLowerCase().trim();

        const user = await prisma.user.findUnique({
          where: { email: normalised },
        });

        if (!user || !user.password) return null;

        const passwordMatch = await bcrypt.compare(credentials.password, user.password);
        if (!passwordMatch) return null;

        return {
          id:    user.id,
          name:  user.name,
          email: user.email,
          tier:  resolvedTier(normalised, user.tier),
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
        token.tier = resolvedTier(
          (user.email ?? ""),
          (user as { tier?: string }).tier ?? "free",
        );
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id     = token.id as string;
        (session.user as { tier?: string }).tier = token.tier as string;
      }
      return session;
    },
  },

  pages: { signIn: "/" },
  secret: process.env.NEXTAUTH_SECRET,
};
