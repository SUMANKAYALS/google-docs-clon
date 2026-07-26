import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { loginSchema } from "@/lib/validations/auth";
import { authConfig } from "@/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[Auth Authorize] Initiating credential verification...");
        await connectToDatabase();

        const validatedFields = loginSchema.safeParse(credentials);
        if (!validatedFields.success) {
          console.error("[Auth Authorize Error] Validation failed:", validatedFields.error.issues);
          throw new Error("Invalid input");
        }

        const email = validatedFields.data.email.trim().toLowerCase();
        const password = validatedFields.data.password;
        console.log("[Auth Authorize] Received email for lookup:", email);

        const user = await User.findOne({ email }).select("+password +isVerified");
        if (!user || !user.password) {
          console.error("[Auth Authorize Error] User not found or missing password for email:", email);
          throw new Error("User not found");
        }

        console.log("[Auth Authorize] User record located:", {
          id: user._id.toString(),
          email: user.email,
          isVerified: user.isVerified,
        });

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        console.log("[Auth Authorize] Password match result:", isPasswordMatch);

        if (!isPasswordMatch) {
          console.error("[Auth Authorize Error] Incorrect password attempt for email:", email);
          throw new Error("Incorrect password");
        }

        if (user.isVerified === false) {
          console.error("[Auth Authorize Error] Unverified account login attempt for email:", email);
          throw new Error("Email not verified");
        }

        console.log("[Auth Authorize Success] Authorization granted for user:", email);

        return {
          id: user._id.toString(),
          name: user.name || "",
          email: user.email || "",
          image: user.image || "",
          role: user.role || "user",
        };
      },
    }),
  ],
  events: {
    async signIn(message) {
      console.log("[Auth Event: signIn] Session established for user:", message.user?.email);
    },
    async signOut() {
      console.log("[Auth Event: signOut] User session destroyed.");
    },
  },
});
