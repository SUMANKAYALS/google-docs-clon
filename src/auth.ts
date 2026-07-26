import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { loginSchema } from "@/lib/validations/auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectToDatabase();

        // 2. Standard credentials password validation
        const validatedFields = loginSchema.safeParse(credentials);
        if (!validatedFields.success) {
          throw new Error('Invalid input');
        }

        // Normalize email for lookup
        const email = validatedFields.data.email.trim().toLowerCase();
        const password = validatedFields.data.password;
        console.log('Authorize: received email', email);
        console.log('Authorize: attempting user lookup');

        const user = await User.findOne({ email })
          .select("+password +isVerified");
        if (!user || !user.password) {
          console.log('Authorize: user not found or missing password');
          throw new Error('User not found');
        }
        console.log('Authorize: user found', { id: user._id, isVerified: user.isVerified });

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        console.log('Authorize: password compare result', isPasswordMatch);
        if (!isPasswordMatch) {
          throw new Error('Incorrect password');
        }

        // Enforce email verification constraint
        if (user.isVerified === false) {
          console.log('Authorize: email not verified');
          throw new Error('Email not verified');
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image || "",
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
      }
      if (trigger === "update" && session) {
        token.name = session.user?.name || token.name;
        token.image = session.user?.image || token.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.image as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "clouds-docs-super-secret-key-change-in-production-12345",
});
