// import { type Editor } from "@tiptap/react";
// import { type LucideIcon } from "lucide-react";
// import { type DefaultSession } from "next-auth";

// declare module "next-auth" {
//   interface Session {
//     user: {
//       id: string;
//       role?: string;
//     } & DefaultSession["user"];
//   }

//   interface User {
//     id?: string;
//     role?: string;
//   }
// }

// export type UserRole = "owner" | "editor" | "viewer";

// export interface CollaboratorMemberDetails {
//   userId: string;
//   role: "editor" | "viewer";
//   joinedAt: string;
//   name?: string;
//   email?: string;
//   image?: string;
// }

// export interface SearchedUserItem {
//   id: string;
//   name: string;
//   email: string;
//   image?: string;
//   isCollaborator?: boolean;
//   isPendingInvite?: boolean;
// }

// export interface InvitationItem {
//   id: string;
//   sender: {
//     id: string;
//     name: string;
//     email: string;
//     image?: string;
//   };
//   document: {
//     id: string;
//     title: string;
//   };
//   role: "editor" | "viewer";
//   status: "pending" | "accepted" | "rejected" | "expired";
//   createdAt: string;
// }

// export interface EditorState {
//   editor: Editor | null;
//   setEditor: (editor: Editor | null) => void;
//   pageTheme: "light" | "dark";
//   setPageTheme: (theme: "light" | "dark") => void;
// }

// export interface ToolbarButtonProps {
//   onClick?: () => void;
//   isActive?: boolean;
//   icon: LucideIcon;
//   label: string;
// }

// export interface FontOption {
//   label: string;
//   value: string;
// }

// export interface HeadingOption {
//   label: string;
//   value: number;
//   fontSize: string;
// }

// export interface DocumentItem {
//   id: string;
//   title: string;
//   content: string;
//   ownerId: string;
//   inviteCode?: string;
//   collaboratorMembers?: CollaboratorMemberDetails[];
//   userRole?: UserRole;
//   isArchived: boolean;
//   isFavorite: boolean;
//   createdAt: string;
//   updatedAt: string;
//   leftMargin?: number;
//   rightMargin?: number;
// }



import { type Editor } from "@tiptap/react";
import { type LucideIcon } from "lucide-react";

export type UserRole = "owner" | "editor" | "viewer";

export interface CollaboratorMemberDetails {
  userId: string;
  role: "editor" | "viewer";
  joinedAt: string;
  name?: string;
  email?: string;
  image?: string;
}

export interface SearchedUserItem {
  id: string;
  name: string;
  email: string;
  image?: string;
  isCollaborator?: boolean;
  isPendingInvite?: boolean;
}

export interface InvitationItem {
  id: string;
  sender: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  document: {
    id: string;
    title: string;
  };
  role: "editor" | "viewer";
  status: "pending" | "accepted" | "rejected" | "expired";
  createdAt: string;
}

export interface EditorState {
  editor: Editor | null;
  setEditor: (editor: Editor | null) => void;
  pageTheme: "light" | "dark";
  setPageTheme: (theme: "light" | "dark") => void;
}

export interface ToolbarButtonProps {
  onClick?: () => void;
  isActive?: boolean;
  icon: LucideIcon;
  label: string;
}

export interface FontOption {
  label: string;
  value: string;
}

export interface HeadingOption {
  label: string;
  value: number;
  fontSize: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  inviteCode?: string;
  collaboratorMembers?: CollaboratorMemberDetails[];
  userRole?: UserRole;
  isArchived: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  leftMargin?: number;
  rightMargin?: number;
}