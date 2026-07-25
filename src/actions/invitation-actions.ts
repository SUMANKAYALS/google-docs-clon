"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { auth } from "@/auth";
import { connectToDatabase, isValidObjectId } from "@/lib/db";
import { DocumentModel } from "@/models/Document";
import { User } from "@/models/User";
import { InvitationModel } from "@/models/Invitation";
import { generateInviteCode } from "@/lib/invite-code";
import { type InvitationItem, type SearchedUserItem } from "@/types";

export async function searchUsersAction(query: string, documentId: string) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { error: "Unauthorized", users: [] };
    }

    const trimmedQuery = query.trim();
    if (!trimmedQuery || trimmedQuery.length < 2) {
      return { success: true, users: [] };
    }

    await connectToDatabase();

    const doc = await DocumentModel.findById(documentId).lean();
    if (!doc) {
      return { error: "Document not found", users: [] };
    }

    const existingCollaboratorIds = new Set<string>([
      doc.owner.toString(),
      ...(doc.collaborators || []).map((c) => c.toString()),
      ...(doc.collaboratorMembers || []).map((m) => m.userId.toString()),
    ]);

    const pendingInvites = await InvitationModel.find({
      document: documentId,
      status: "pending",
    }).lean();

    const pendingReceiverIds = new Set<string>(
      pendingInvites.map((inv) => inv.receiver.toString())
    );

    const users = await User.find({
      _id: { $ne: session.user.id },
      $or: [
        { name: { $regex: trimmedQuery, $options: "i" } },
        { email: { $regex: trimmedQuery, $options: "i" } },
      ],
    })
      .select("name email image")
      .limit(10)
      .lean();

    const searchedUsers: SearchedUserItem[] = users.map((u) => {
      const uId = u._id.toString();
      return {
        id: uId,
        name: u.name,
        email: u.email,
        image: u.image || undefined,
        isCollaborator: existingCollaboratorIds.has(uId),
        isPendingInvite: pendingReceiverIds.has(uId),
      };
    });

    return { success: true, users: searchedUsers };
  } catch (error) {
    console.error("Search Users Action Error:", error);
    return { error: "Failed to search users", users: [] };
  }
}

export async function sendUserInvitationAction(
  documentId: string,
  receiverId: string,
  role: "editor" | "viewer" = "editor"
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { error: "Unauthorized" };
    }

    if (!isValidObjectId(documentId) || !isValidObjectId(receiverId)) {
      return { error: "Invalid document or user ID" };
    }

    if (session.user.id === receiverId) {
      return { error: "You cannot invite yourself" };
    }

    await connectToDatabase();

    const doc = await DocumentModel.findById(documentId);
    if (!doc) {
      return { error: "Document not found" };
    }

    if (doc.owner.toString() !== session.user.id) {
      return { error: "Only the document owner can send invitations" };
    }

    const isAlreadyCollaborator =
      doc.collaborators.some((c) => c.toString() === receiverId) ||
      doc.collaboratorMembers.some((m) => m.userId.toString() === receiverId);

    if (isAlreadyCollaborator) {
      return { error: "User is already a collaborator on this document" };
    }

    const existingInvite = await InvitationModel.findOne({
      document: documentId,
      receiver: receiverId,
      status: "pending",
    });

    if (existingInvite) {
      return { error: "An invitation is already pending for this user" };
    }

    await InvitationModel.create({
      sender: session.user.id,
      receiver: receiverId,
      document: documentId,
      role,
      status: "pending",
    });

    return { success: true };
  } catch (error) {
    console.error("Send User Invitation Error:", error);
    return { error: "Failed to send invitation" };
  }
}

export async function getUserInvitationsAction() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { error: "Unauthorized", invitations: [] };
    }

    await connectToDatabase();

    const invites = await InvitationModel.find({
      receiver: session.user.id,
      status: "pending",
    })
      .populate("sender", "name email image")
      .populate("document", "title")
      .sort({ createdAt: -1 })
      .lean();

    const invitations: InvitationItem[] = invites.map((inv) => {
      const senderObj = inv.sender as unknown as { _id?: mongoose.Types.ObjectId; name?: string; email?: string; image?: string } | null;
      const docObj = inv.document as unknown as { _id?: mongoose.Types.ObjectId; title?: string } | null;

      return {
        id: inv._id.toString(),
        sender: {
          id: senderObj?._id?.toString() || "",
          name: senderObj?.name || "Collaborator",
          email: senderObj?.email || "",
          image: senderObj?.image || undefined,
        },
        document: {
          id: docObj?._id?.toString() || "",
          title: docObj?.title || "Untitled Document",
        },
        role: (inv.role as "editor" | "viewer") || "editor",
        status: inv.status as "pending" | "accepted" | "rejected" | "expired",
        createdAt: inv.createdAt ? new Date(inv.createdAt).toISOString() : new Date().toISOString(),
      };
    });

    return { success: true, invitations };
  } catch (error) {
    console.error("Get User Invitations Error:", error);
    return { error: "Failed to load invitations", invitations: [] };
  }
}

export async function acceptInvitationAction(invitationId: string) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { error: "Unauthorized" };
    }

    if (!isValidObjectId(invitationId)) {
      return { error: "Invalid invitation ID" };
    }

    await connectToDatabase();

    const invite = await InvitationModel.findOne({
      _id: invitationId,
      receiver: session.user.id,
      status: "pending",
    });

    if (!invite) {
      return { error: "Invitation not found or already processed" };
    }

    const doc = await DocumentModel.findById(invite.document);
    if (!doc) {
      return { error: "Document no longer exists" };
    }

    const userId = session.user.id;
    const isAlreadyCollaborator = doc.collaboratorMembers.some(
      (m) => m.userId.toString() === userId
    );

    if (!isAlreadyCollaborator) {
      const objectId = new mongoose.Types.ObjectId(userId);
      doc.collaborators.push(objectId);
      doc.collaboratorMembers.push({
        userId: objectId,
        role: invite.role,
        joinedAt: new Date(),
      });
      await doc.save();
    }

    invite.status = "accepted";
    await invite.save();

    revalidatePath("/documents");

    return {
      success: true,
      documentId: doc._id.toString(),
    };
  } catch (error) {
    console.error("Accept Invitation Error:", error);
    return { error: "Failed to accept invitation" };
  }
}

export async function rejectInvitationAction(invitationId: string) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { error: "Unauthorized" };
    }

    if (!isValidObjectId(invitationId)) {
      return { error: "Invalid invitation ID" };
    }

    await connectToDatabase();

    const invite = await InvitationModel.findOne({
      _id: invitationId,
      receiver: session.user.id,
      status: "pending",
    });

    if (!invite) {
      return { error: "Invitation not found" };
    }

    invite.status = "rejected";
    await invite.save();

    return { success: true };
  } catch (error) {
    console.error("Reject Invitation Error:", error);
    return { error: "Failed to reject invitation" };
  }
}

export async function regenerateInviteCodeAction(documentId: string) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { error: "Unauthorized" };
    }

    if (!isValidObjectId(documentId)) {
      return { error: "Invalid document ID" };
    }

    await connectToDatabase();

    const doc = await DocumentModel.findById(documentId);
    if (!doc) {
      return { error: "Document not found" };
    }

    if (doc.owner.toString() !== session.user.id) {
      return { error: "Only the document owner can regenerate invite links" };
    }

    doc.inviteCode = generateInviteCode();
    await doc.save();

    revalidatePath(`/documents/${documentId}`);

    return {
      success: true,
      inviteCode: doc.inviteCode,
    };
  } catch (error) {
    console.error("Regenerate Invite Code Error:", error);
    return { error: "Failed to regenerate invite link" };
  }
}
