import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVersionHistory extends Document {
  _id: mongoose.Types.ObjectId;
  documentId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  title: string;
  content: string;
  versionName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VersionHistorySchema = new Schema<IVersionHistory>(
  {
    documentId: { type: Schema.Types.ObjectId, ref: "Document", required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    versionName: { type: String, default: "" },
  },
  { timestamps: true }
);

export const VersionHistoryModel: Model<IVersionHistory> =
  mongoose.models.VersionHistory ||
  mongoose.model<IVersionHistory>("VersionHistory", VersionHistorySchema);
