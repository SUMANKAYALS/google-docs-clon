"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import mongoose from "mongoose";
import { auth } from "@/auth";
import { connectToDatabase, isValidObjectId } from "@/lib/db";
import { DocumentModel } from "@/models/Document";
import { User } from "@/models/User";
import { generateInviteCode } from "@/lib/invite-code";
import { type CollaboratorMemberDetails } from "@/types";

export async function getInviteCodeAction(documentId: string) {
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

    const isOwner = doc.owner.toString() === session.user.id;
    if (!isOwner) {
      return { error: "Only the document owner can access the invite link" };
    }

    if (!doc.inviteCode) {
      doc.inviteCode = generateInviteCode();
      await doc.save();
    }

    return {
      success: true,
      inviteCode: doc.inviteCode,
    };
  } catch (error) {
    console.error("Get Invite Code Error:", error);
    return { error: "Failed to generate invite link" };
  }
}

// Pure read-only lookup for /join/[inviteCode] page render
export async function getInviteDetailsAction(inviteCode: string) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { error: "Unauthorized" };
    }

    const trimmedCode = inviteCode.trim().toUpperCase();
    if (!trimmedCode) {
      return { error: "Invalid invite code" };
    }

    await connectToDatabase();

    const doc = await DocumentModel.findOne({ inviteCode: trimmedCode }).lean();
    if (!doc) {
      return { error: "Invalid or expired invite code" };
    }

    const ownerUser = await User.findById(doc.owner).select("name email image").lean();

    const userId = session.user.id;
    const isOwner = doc.owner.toString() === userId;
    const isAlreadyMember =
      isOwner ||
      (doc.collaborators || []).some((c) => c.toString() === userId) ||
      (doc.collaboratorMembers || []).some((m) => m.userId.toString() === userId);

    return {
      success: true,
      document: {
        id: doc._id.toString(),
        title: doc.title || "Untitled Document",
        ownerName: ownerUser?.name || "Workspace Member",
        ownerEmail: ownerUser?.email || "",
        ownerImage: ownerUser?.image || undefined,
        collaboratorsCount: (doc.collaboratorMembers || []).length + 1,
        isAlreadyMember,
        inviteCode: doc.inviteCode,
      },
    };
  } catch (error) {
    console.error("Get Invite Details Error:", error);
    return { error: "Failed to load invitation details" };
  }
}

// Mutation Server Action executed ONLY on button click
export async function joinDocumentByInviteCodeAction(inviteCode: string) {
  let targetDocumentId: string | null = null;

  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { error: "Unauthorized" };
    }

    const trimmedCode = inviteCode.trim().toUpperCase();
    if (!trimmedCode) {
      return { error: "Invalid invite code format" };
    }

    await connectToDatabase();

    const doc = await DocumentModel.findOne({ inviteCode: trimmedCode });
    if (!doc) {
      return { error: "Invalid or expired invite code" };
    }

    targetDocumentId = doc._id.toString();
    const userId = session.user.id;
    const isOwner = doc.owner.toString() === userId;

    if (!isOwner) {
      const isAlreadyCollaborator = doc.collaboratorMembers.some(
        (m) => m.userId.toString() === userId
      );

      if (!isAlreadyCollaborator) {
        const objectId = new mongoose.Types.ObjectId(userId);
        doc.collaborators.push(objectId);
        doc.collaboratorMembers.push({
          userId: objectId,
          role: "editor",
          joinedAt: new Date(),
        });
        await doc.save();
      }
    }

    revalidatePath("/documents");
    revalidatePath(`/documents/${targetDocumentId}`);
  } catch (error) {
    console.error("Join Document Action Error:", error);
    return { error: "Failed to join document" };
  }

  if (targetDocumentId) {
    redirect(`/documents/${targetDocumentId}`);
  }
}

export async function getDocumentCollaboratorsAction(documentId: string) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { error: "Unauthorized" };
    }

    if (!isValidObjectId(documentId)) {
      return { error: "Invalid document ID" };
    }

    await connectToDatabase();

    const doc = await DocumentModel.findById(documentId).lean();
    if (!doc) {
      return { error: "Document not found" };
    }

    const ownerUser = await User.findById(doc.owner).select("name email image").lean();

    const memberUserIds = (doc.collaboratorMembers || []).map((m) => m.userId);
    const memberUsers = await User.find({ _id: { $in: memberUserIds } })
      .select("name email image")
      .lean();

    const userMap = new Map(memberUsers.map((u) => [u._id.toString(), u]));

    const collaborators: CollaboratorMemberDetails[] = (doc.collaboratorMembers || []).map((m) => {
      const uId = m.userId.toString();
      const uObj = userMap.get(uId);
      return {
        userId: uId,
        role: m.role || "editor",
        joinedAt: m.joinedAt ? m.joinedAt.toISOString() : new Date().toISOString(),
        name: uObj?.name || "Collaborator",
        email: uObj?.email || "",
        image: uObj?.image || undefined,
      };
    });

    return {
      success: true,
      owner: {
        userId: doc.owner.toString(),
        name: ownerUser?.name || "Owner",
        email: ownerUser?.email || "",
        image: ownerUser?.image || undefined,
      },
      collaborators,
      inviteCode: doc.inviteCode,
    };
  } catch (error) {
    console.error("Get Document Collaborators Error:", error);
    return { error: "Failed to load collaborators list" };
  }
}

export async function updateCollaboratorRoleAction(
  documentId: string,
  targetUserId: string,
  newRole: "editor" | "viewer"
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { error: "Unauthorized" };
    }

    if (!isValidObjectId(documentId) || !isValidObjectId(targetUserId)) {
      return { error: "Invalid document or user ID" };
    }

    await connectToDatabase();

    const doc = await DocumentModel.findById(documentId);
    if (!doc) {
      return { error: "Document not found" };
    }

    if (doc.owner.toString() !== session.user.id) {
      return { error: "Only the document owner can modify collaborator permissions" };
    }

    const memberIndex = doc.collaboratorMembers.findIndex(
      (m) => m.userId.toString() === targetUserId
    );

    if (memberIndex === -1) {
      return { error: "Collaborator not found on this document" };
    }

    doc.collaboratorMembers[memberIndex].role = newRole;
    await doc.save();

    revalidatePath(`/documents/${documentId}`);

    return { success: true };
  } catch (error) {
    console.error("Update Collaborator Role Error:", error);
    return { error: "Failed to update collaborator permission" };
  }
}

export async function removeCollaboratorAction(documentId: string, targetUserId: string) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { error: "Unauthorized" };
    }

    if (!isValidObjectId(documentId) || !isValidObjectId(targetUserId)) {
      return { error: "Invalid document or user ID" };
    }

    await connectToDatabase();

    const doc = await DocumentModel.findById(documentId);
    if (!doc) {
      return { error: "Document not found" };
    }

    if (doc.owner.toString() !== session.user.id) {
      return { error: "Only the document owner can remove collaborators" };
    }

    doc.collaborators = doc.collaborators.filter(
      (id) => id.toString() !== targetUserId
    );
    doc.collaboratorMembers = doc.collaboratorMembers.filter(
      (m) => m.userId.toString() !== targetUserId
    );

    await doc.save();

    revalidatePath(`/documents/${documentId}`);

    return { success: true };
  } catch (error) {
    console.error("Remove Collaborator Error:", error);
    return { error: "Failed to remove collaborator" };
  }
}
