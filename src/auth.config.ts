// import type { NextAuthConfig } from "next-auth";

// const useSecureCookies = process.env.NODE_ENV === "production" && process.env.NEXTAUTH_URL?.startsWith("https://");
// const cookiePrefix = useSecureCookies ? "__Secure-" : "";

// export const authConfig: NextAuthConfig = {
//   trustHost: true,
//   secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "clouds-docs-super-secret-key-change-in-production-12345",
//   pages: {
//     signIn: "/login",
//     error: "/login",
//   },
//   session: {
//     strategy: "jwt",
//     maxAge: 30 * 24 * 60 * 60, // 30 days
//   },
//   cookies: {
//     sessionToken: {
//       name: `${cookiePrefix}authjs.session-token`,
//       options: {
//         httpOnly: true,
//         sameSite: "lax",
//         path: "/",
//         secure: useSecureCookies,
//       },
//     },
//     callbackUrl: {
//       name: `${cookiePrefix}authjs.callback-url`,
//       options: {
//         sameSite: "lax",
//         path: "/",
//         secure: useSecureCookies,
//       },
//     },
//     csrfToken: {
//       name: `${cookiePrefix}authjs.csrf-token`,
//       options: {
//         httpOnly: true,
//         sameSite: "lax",
//         path: "/",
//         secure: useSecureCookies,
//       },
//     },
//   },
//   providers: [], // Empty array for Edge compatibility; Node.js providers added in auth.ts
//   callbacks: {
//     async jwt({ token, user, trigger, session }) {
//       if (user) {
//         token.id = user.id;
//         token.name = user.name;
//         token.email = user.email;
//         token.image = user.image;
//         token.role = (user as any).role || "user";
//       }

//       if (trigger === "update" && session) {
//         token.name = session.user?.name || token.name;
//         token.image = session.user?.image || token.image;
//       }

//       return token;
//     },
//     async session({ session, token }) {
//       if (token && session.user) {
//         session.user.id = token.id as string;
//         session.user.name = token.name as string;
//         session.user.email = token.email as string;
//         session.user.image = token.image as string;
//         (session.user as any).role = (token.role as string) || "user";
//       }

//       return session;
//     },
//   },
// };



import type { NextAuthConfig } from "next-auth";

const useSecureCookies =
  process.env.NODE_ENV === "production" &&
  process.env.NEXTAUTH_URL?.startsWith("https://");

const cookiePrefix = useSecureCookies ? "__Secure-" : "";

type UserWithRole = {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
};

type SessionUserWithRole = {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
};

export const authConfig: NextAuthConfig = {
  trustHost: true,

  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "clouds-docs-super-secret-key-change-in-production-12345",

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  cookies: {
    sessionToken: {
      name: `${cookiePrefix}authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },

    callbackUrl: {
      name: `${cookiePrefix}authjs.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },

    csrfToken: {
      name: `${cookiePrefix}authjs.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
  },

  // Empty array for Edge compatibility.
  // Actual providers are added in auth.ts
  providers: [],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const currentUser = user as UserWithRole;

        // token.id = currentUser.id;
        token.id = currentUser.id ?? "";
        token.name = currentUser.name;
        token.email = currentUser.email;
        token.image = currentUser.image;
        token.role = currentUser.role ?? "user";
      }

      if (trigger === "update" && session) {
        token.name = session.user?.name ?? token.name;
        token.image = session.user?.image ?? token.image;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        const sessionUser = session.user as SessionUserWithRole;

        sessionUser.id = token.id as string;
        sessionUser.name = token.name;
        sessionUser.email = token.email;
        sessionUser.image = token.image;
        sessionUser.role = (token.role as string) ?? "user";
      }

      return session;
    },
  },
};