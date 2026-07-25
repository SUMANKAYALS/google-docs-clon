import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICommentReply {
  _id: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IComment extends Document {
  _id: mongoose.Types.ObjectId;
  documentId: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  content: string;
  anchorText?: string;
  isResolved: boolean;
  replies: ICommentReply[];
  createdAt: Date;
  updatedAt: Date;
}

const ReplySchema = new Schema<ICommentReply>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const CommentSchema = new Schema<IComment>(
  {
    documentId: { type: Schema.Types.ObjectId, ref: "Document", required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true },
    anchorText: { type: String, default: "" },
    isResolved: { type: Boolean, default: false, index: true },
    replies: [ReplySchema],
  },
  { timestamps: true }
);

CommentSchema.index({ documentId: 1, isResolved: 1, createdAt: -1 });

export const CommentModel: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);
