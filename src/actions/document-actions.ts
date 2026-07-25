"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { connectToDatabase, isValidObjectId } from "@/lib/db";
import { DocumentModel } from "@/models/Document";
import { generateInviteCode } from "@/lib/invite-code";
import { type DocumentItem, type UserRole } from "@/types";

export async function createDocumentAction(initialTitle?: string) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { error: "Unauthorized" };
    }

    await connectToDatabase();

    const newDoc = await DocumentModel.create({
      title: initialTitle?.trim() || "Untitled Document",
      content: "",
      owner: session.user.id,
      collaborators: [],
      collaboratorMembers: [],
      inviteCode: generateInviteCode(),
      visibility: "restricted",
      isArchived: false,
      isFavorite: false,
    });

    revalidatePath("/documents");

    return {
      success: true,
      document: {
        id: newDoc._id.toString(),
        title: newDoc.title,
        content: newDoc.content,
        ownerId: newDoc.owner.toString(),
        inviteCode: newDoc.inviteCode,
        userRole: "owner",
        isArchived: newDoc.isArchived,
        isFavorite: newDoc.isFavorite,
        createdAt: newDoc.createdAt.toISOString(),
        updatedAt: newDoc.updatedAt.toISOString(),
      } as DocumentItem,
    };
  } catch (error) {
    console.error("Create Document Action Error:", error);
    return { error: "Failed to create document" };
  }
}

export async function getUserDocumentsAction(
  searchQuery?: string,
  filterType: "all" | "favorites" | "trash" = "all",
  sortBy: "updatedAt" | "title" | "createdAt" = "updatedAt"
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { error: "Unauthorized", documents: [] };
    }

    if (!isValidObjectId(session.user.id)) {
      return { error: "Invalid User Session ID", documents: [] };
    }

    await connectToDatabase();

    const query: Record<string, unknown> = {
      $or: [
        { owner: session.user.id },
        { collaborators: session.user.id },
      ],
    };

    if (filterType === "trash") {
      query.isArchived = true;
    } else {
      query.isArchived = false;
      if (filterType === "favorites") {
        query.isFavorite = true;
      }
    }

    if (searchQuery && searchQuery.trim() !== "") {
      query.title = { $regex: searchQuery.trim(), $options: "i" };
    }

    const sortOption: Record<string, 1 | -1> = {};
    if (sortBy === "title") {
      sortOption.title = 1;
    } else if (sortBy === "createdAt") {
      sortOption.createdAt = -1;
    } else {
      sortOption.updatedAt = -1;
    }

    const docs = await DocumentModel.find(query).sort(sortOption).lean();

    const documents: DocumentItem[] = docs.map((doc) => {
      let role: UserRole = "viewer";
      if (doc.owner.toString() === session.user.id) {
        role = "owner";
      } else {
        const member = doc.collaboratorMembers?.find(
          (m) => m.userId.toString() === session.user.id
        );
        role = (member?.role as UserRole) || "editor";
      }

      return {
        id: doc._id.toString(),
        title: doc.title,
        content: doc.content || "",
        ownerId: doc.owner.toString(),
        inviteCode: doc.inviteCode,
        userRole: role,
        isArchived: doc.isArchived,
        isFavorite: doc.isFavorite,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      };
    });

    return { success: true, documents };
  } catch (error) {
    console.error("Get User Documents Error:", error);
    return { error: "Failed to load documents", documents: [] };
  }
}

export async function getDocumentByIdAction(documentId: string) {
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

    console.log(`[Document Actions] Fetched Document ID: ${documentId}, Content length: ${doc.content?.length || 0}`);
    console.log(`[Document Actions] Content details (first 300 chars):`, doc.content?.slice(0, 300) || "empty");

    const isOwner = doc.owner.toString() === session.user.id;
    const member = doc.collaboratorMembers?.find(
      (m) => m.userId.toString() === session.user.id
    );
    const isCollaborator = Boolean(member || doc.collaborators?.some((c) => c.toString() === session.user.id));

    if (!isOwner && !isCollaborator) {
      return { error: "Forbidden: You do not have permission to view this document" };
    }

    let userRole: UserRole = "viewer";
    if (isOwner) {
      userRole = "owner";
    } else if (member) {
      userRole = (member.role as UserRole) || "editor";
    } else {
      userRole = "editor";
    }

    const document: DocumentItem = {
      id: doc._id.toString(),
      title: doc.title,
      content: doc.content || "",
      ownerId: doc.owner.toString(),
      inviteCode: doc.inviteCode,
      userRole,
      isArchived: doc.isArchived,
      isFavorite: doc.isFavorite,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };

    return { success: true, document };
  } catch (error) {
    console.error("Get Document By ID Error:", error);
    return { error: "Invalid document ID or database connection failure" };
  }
}

export async function updateDocumentTitleAction(documentId: string, title: string) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { error: "Unauthorized" };
    }

    if (!isValidObjectId(documentId)) {
      return { error: "Invalid document ID" };
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return { error: "Document title cannot be empty" };
    }

    await connectToDatabase();

    const doc = await DocumentModel.findById(documentId);
    if (!doc) {
      return { error: "Document not found" };
    }

    const isOwner = doc.owner.toString() === session.user.id;
    const member = doc.collaboratorMembers?.find(
      (m) => m.userId.toString() === session.user.id
    );

    if (!isOwner && (!member || member.role === "viewer")) {
      return { error: "Forbidden: Viewers cannot rename this document" };
    }

    doc.title = trimmedTitle;
    await doc.save();

    revalidatePath("/documents");
    revalidatePath(`/documents/${documentId}`);

    return { success: true, title: doc.title };
  } catch (error) {
    console.error("Update Document Title Error:", error);
    return { error: "Failed to update title" };
  }
}

export async function updateDocumentContentAction(documentId: string, content: string) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!isValidObjectId(documentId)) {
      return { success: false, error: "Invalid document ID" };
    }

    await connectToDatabase();

    const doc = await DocumentModel.findById(documentId);
    if (!doc) {
      return { success: false, error: "Document not found" };
    }

    const isOwner = doc.owner.toString() === session.user.id;
    const member = doc.collaboratorMembers?.find(
      (m) => m.userId.toString() === session.user.id
    );

    if (!isOwner && (!member || member.role === "viewer")) {
      return { success: false, error: "Forbidden: Viewers cannot edit document content" };
    }

    if (doc.content === content) {
      return { success: true, updatedAt: doc.updatedAt.toISOString(), skipped: true };
    }

    doc.content = content;
    doc.updatedBy = new mongoose.Types.ObjectId(session.user.id);
    await doc.save();

    return { success: true, updatedAt: doc.updatedAt.toISOString(), skipped: false };
  } catch (error) {
    console.error("Update Document Content Error:", error);
    return { success: false, error: "Failed to auto-save document content" };
  }
}

export async function toggleFavoriteDocumentAction(documentId: string) {
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

    doc.isFavorite = !doc.isFavorite;
    await doc.save();

    revalidatePath("/documents");

    return { success: true, isFavorite: doc.isFavorite };
  } catch (error) {
    console.error("Toggle Favorite Error:", error);
    return { error: "Failed to toggle favorite status" };
  }
}

export async function archiveDocumentAction(documentId: string) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { error: "Unauthorized" };
    }

    if (!isValidObjectId(documentId)) {
      return { error: "Invalid document ID" };
    }

    await connectToDatabase();

    const doc = await DocumentModel.findOne({ _id: documentId, owner: session.user.id });
    if (!doc) {
      return { error: "Document not found or permission denied" };
    }

    doc.isArchived = true;
    await doc.save();

    revalidatePath("/documents");

    return { success: true };
  } catch (error) {
    console.error("Archive Document Error:", error);
    return { error: "Failed to move document to trash" };
  }
}

export async function restoreDocumentAction(documentId: string) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { error: "Unauthorized" };
    }

    if (!isValidObjectId(documentId)) {
      return { error: "Invalid document ID" };
    }

    await connectToDatabase();

    const doc = await DocumentModel.findOne({ _id: documentId, owner: session.user.id });
    if (!doc) {
      return { error: "Document not found or permission denied" };
    }

    doc.isArchived = false;
    await doc.save();

    revalidatePath("/documents");

    return { success: true };
  } catch (error) {
    console.error("Restore Document Error:", error);
    return { error: "Failed to restore document" };
  }
}

export async function deleteDocumentPermanentlyAction(documentId: string) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { error: "Unauthorized" };
    }

    if (!isValidObjectId(documentId)) {
      return { error: "Invalid document ID" };
    }

    await connectToDatabase();

    const doc = await DocumentModel.findOneAndDelete({
      _id: documentId,
      owner: session.user.id,
    });

    if (!doc) {
      return { error: "Document not found or permission denied" };
    }

    revalidatePath("/documents");

    return { success: true };
  } catch (error) {
    console.error("Delete Document Permanently Error:", error);
    return { error: "Failed to delete document permanently" };
  }
}

export async function duplicateDocumentAction(documentId: string) {
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

    const duplicateDoc = await DocumentModel.create({
      title: `Copy of ${doc.title}`,
      content: doc.content || "",
      owner: session.user.id,
      collaborators: [],
      collaboratorMembers: [],
      inviteCode: generateInviteCode(),
      visibility: "restricted",
      isArchived: false,
      isFavorite: false,
    });

    revalidatePath("/documents");

    return {
      success: true,
      document: {
        id: duplicateDoc._id.toString(),
        title: duplicateDoc.title,
        content: duplicateDoc.content,
        ownerId: duplicateDoc.owner.toString(),
        inviteCode: duplicateDoc.inviteCode,
        userRole: "owner",
        isArchived: duplicateDoc.isArchived,
        isFavorite: duplicateDoc.isFavorite,
        createdAt: duplicateDoc.createdAt.toISOString(),
        updatedAt: duplicateDoc.updatedAt.toISOString(),
      } as DocumentItem,
    };
  } catch (error) {
    console.error("Duplicate Document Error:", error);
    return { error: "Failed to duplicate document" };
  }
}

export async function leaveDocumentAction(documentId: string) {
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

    if (doc.owner.toString() === session.user.id) {
      return { error: "Owners cannot leave their own document. Transfer ownership or delete the document instead." };
    }

    doc.collaborators = doc.collaborators.filter(
      (c) => c.toString() !== session.user.id
    );
    doc.collaboratorMembers = doc.collaboratorMembers.filter(
      (m) => m.userId.toString() !== session.user.id
    );

    await doc.save();

    revalidatePath("/documents");
    revalidatePath(`/documents/${documentId}`);

    return { success: true };
  } catch (error) {
    console.error("Leave Document Error:", error);
    return { error: "Failed to leave document collaboration" };
  }
}
