<div align="center">

# 📄 TechDocs

### A feature-rich Google Docs clone — real-time, collaborative, and beautifully crafted.

[![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Tiptap](https://img.shields.io/badge/Tiptap-Editor-6200EA?style=for-the-badge)](https://tiptap.dev/)
[![Convex](https://img.shields.io/badge/Convex-DB-F78166?style=for-the-badge)](https://convex.dev/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge&logo=clerk)](https://clerk.com/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[🚀 Live Demo](#) · [📂 GitHub](https://github.com/SUMANKAYALS) · [💼 LinkedIn](#)

</div>

---

## ✨ Features

| Category | Features |
|---|---|
| **Editor** | 📝 Rich Text Editor · 🎨 Text Formatting Tools · 📝 Lists & Checklists · 📊 Table Support · 🖼️ Image Uploads · 🔗 Link Embedding |
| **Collaboration** | 🤝 Real-time Collaboration · 🎯 Cursor Tracking · 💭 Comments & Mentions · 🔔 Notifications System |
| **Documents** | 📑 Templates · 📋 Copy & Paste Formatting · ↩️ Undo/Redo History · 📏 Margin Controls · ⬇️ Export (PDF, HTML, TXT, JSON) |
| **Workspace** | 👥 User Profiles · 🏢 Organization Workspaces · ✉️ Organization Invites |
| **Platform** | 🔒 Authentication · 📱 Responsive Design · ⚛️ Next.js 15 · 🚀 Deployed on Vercel |

---

## 🛠️ Tech Stack

| Technology | Role |
|---|---|
| [Next.js 15](https://nextjs.org/) | Framework & App Router |
| [Tiptap](https://tiptap.dev/) | Rich Text Editor Engine |
| [Convex](https://convex.dev/) | Real-time Database & Backend |
| [Clerk](https://clerk.com/) | Authentication & User Management |
| [Shadcn UI](https://ui.shadcn.com/) | Component Library |
| [Tailwind CSS](https://tailwindcss.com/) | Styling |
| [TypeScript](https://www.typescriptlang.org/) | Type Safety |
| [Vercel](https://vercel.com/) | Deployment |

---

## 🚀 Getting Started

### Prerequisites

- Node.js `18+`
- npm / yarn / pnpm
- A [Convex](https://convex.dev/) account
- A [Clerk](https://clerk.com/) account

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/SUMANKAYALS/techdocs.git
cd techdocs
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

```bash
cp .env.example .env.local
```

Fill in the values (see table below).

**4. Start the Convex dev server**

```bash
npx convex dev
```

**5. Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Environment Variables

| Variable | Description | Source |
|---|---|---|
| `CONVEX_DEPLOYMENT` | Your Convex deployment name | [Convex Dashboard](https://dashboard.convex.dev/) |
| `NEXT_PUBLIC_CONVEX_URL` | Public Convex backend URL | [Convex Dashboard](https://dashboard.convex.dev/) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | [Clerk Dashboard](https://dashboard.clerk.com/) |
| `CLERK_SECRET_KEY` | Clerk secret key (server-side only) | [Clerk Dashboard](https://dashboard.clerk.com/) |

---

## 📁 Project Structure

```
techdocs/
├── app/                        # Next.js App Router pages
│   ├── (home)/                 # Dashboard & document list
│   ├── documents/[documentId]/ # Editor route
│   └── layout.tsx              # Root layout with providers
├── components/                 # Reusable UI components
│   ├── editor.tsx              # Tiptap editor instance
│   ├── toolbar.tsx             # Formatting toolbar
│   └── convex-client-provider.tsx
├── convex/                     # Convex backend functions
│   ├── documents.ts            # CRUD mutations & queries
│   ├── schema.ts               # Database schema
│   └── auth.config.ts          # Clerk ↔ Convex auth bridge
├── hooks/                      # Custom React hooks
├── lib/                        # Utilities & helpers
├── public/                     # Static assets
└── .env.local                  # Environment variables (not committed)
```

---

## 💡 Key Implementation Highlights

### Real-time Collaboration with Convex

```ts
// convex/documents.ts
export const updateDocument = mutation({
  args: { id: v.id("documents"), content: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    return await ctx.db.patch(args.id, { content: args.content });
  },
});
```

### Providers Setup

```tsx
// app/layout.tsx
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <ConvexClientProvider>
        {children}
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
```

---

## 📦 Deployment

This project is deployed on **Vercel**. To deploy your own instance:

1. Push your code to GitHub
2. Import the repo on [vercel.com](https://vercel.com/)
3. Add all environment variables in the Vercel dashboard
4. Deploy — Vercel handles the rest automatically

---

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 👤 Author

**Suman Kayal** · *Sky*

- GitHub: [@SUMANKAYALS](https://github.com/SUMANKAYALS)
- LinkedIn: [Suman Kayal](https://www.linkedin.com/in/suman-kayal10/)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
Made with ❤️ by <a href="https://github.com/SUMANKAYALS">Suman Kayal</a>
</div>
