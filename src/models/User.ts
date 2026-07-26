import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  image?: string;
  role: "user" | "admin";
  username?: string;
  bio?: string;
  location?: string;
  website?: string;
  jobTitle?: string;
  company?: string;
  phoneNumber?: string;
  timezone?: string;
  language?: string;
  defaultFont?: string;
  defaultFontSize?: string;
  pageSize?: string;
  autoSaveEnabled?: boolean;
  aiEnabled?: boolean;
  twoFactorEnabled?: boolean;
  isVerified?: boolean;
  otpBypassToken?: string;
  otpBypassTokenExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      select: false,
    },
    image: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    username: { type: String, default: "" },
    bio: { type: String, default: "" },
    location: { type: String, default: "" },
    website: { type: String, default: "" },
    jobTitle: { type: String, default: "" },
    company: { type: String, default: "" },
    phoneNumber: { type: String, default: "" },
    timezone: { type: String, default: "" },
    language: { type: String, default: "English" },
    defaultFont: { type: String, default: "Inter" },
    defaultFontSize: { type: String, default: "16px" },
    pageSize: { type: String, default: "Letter" },
    autoSaveEnabled: { type: Boolean, default: true },
    aiEnabled: { type: Boolean, default: true },
    twoFactorEnabled: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    otpBypassToken: { type: String, select: false },
    otpBypassTokenExpires: { type: Date, select: false },
  },
  {
    timestamps: true,
  }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
