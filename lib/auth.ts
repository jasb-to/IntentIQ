import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session?.user) {
        session.user.id = user.id
        // Get user subscription status
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: { subscription: true },
        })
        session.user.subscription = dbUser?.subscription
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
}
