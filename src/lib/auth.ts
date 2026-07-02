import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

// Correo que recibe rol de administrador automáticamente
export const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL ?? "danielortizvargas21@gmail.com"
).toLowerCase();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  // En producción define NEXTAUTH_SECRET; este valor solo cubre el desarrollo local
  secret: process.env.NEXTAUTH_SECRET ?? "turing-academy-secreto-solo-desarrollo",
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Correo y contraseña",
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });
        if (!user?.passwordHash) return null;
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // En el primer login (o cuando cambie el rol) cargamos id y rol al token
      if (user) token.userId = user.id;
      if (token.userId && !token.role) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.userId as string },
          select: { role: true },
        });
        token.role = (dbUser?.role as "STUDENT" | "ADMIN") ?? "STUDENT";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = (token.role as "STUDENT" | "ADMIN") ?? "STUDENT";
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // La cuenta configurada como ADMIN_EMAIL recibe rol de administrador
      if (user.email?.toLowerCase() === ADMIN_EMAIL) {
        await prisma.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
      }
    },
  },
};

export function auth() {
  return getServerSession(authOptions);
}
