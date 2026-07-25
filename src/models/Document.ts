import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICollaboratorMember {
  userId: mongoose.Types.ObjectId;
  role: "editor" | "viewer";
  joinedAt: Date;
}

export interface IDocument extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  owner: mongoose.Types.ObjectId;
  collaborators: mongoose.Types.ObjectId[];
  collaboratorMembers: ICollaboratorMember[];
  inviteCode: string;
  visibility: "private" | "restricted" | "public";
  isArchived: boolean;
  isFavorite: boolean;
  leftMargin?: number;
  rightMargin?: number;
  createdAt: Date;
  updatedAt: Date;
  updatedBy?: mongoose.Types.ObjectId;
}

const CollaboratorMemberSchema = new Schema<ICollaboratorMember>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["editor", "viewer"],
      default: "editor",
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const DocumentSchema = new Schema<IDocument>(
  {
    title: {
      type: String,
      required: [true, "Document title is required"],
      trim: true,
      default: "Untitled Document",
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    content: {
      type: String,
      default: "",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    collaborators: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    collaboratorMembers: {
      type: [CollaboratorMemberSchema],
      default: [],
    },
    inviteCode: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    visibility: {
      type: String,
      enum: ["private", "restricted", "public"],
      default: "restricted",
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    isFavorite: {
      type: Boolean,
      default: false,
      index: true,
    },
    leftMargin: {
      type: Number,
      default: 56,
    },
    rightMargin: {
      type: Number,
      default: 56,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

DocumentSchema.index({ owner: 1, isArchived: 1, updatedAt: -1 });
DocumentSchema.index({ "collaboratorMembers.userId": 1, isArchived: 1 });

export const DocumentModel: Model<IDocument> =
  mongoose.models.Document || mongoose.model<IDocument>("Document", DocumentSchema);
