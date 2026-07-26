import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOTP extends Document {
  email: string;
  otp: string; // Hashed verification OTP
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
}

const OTPSchema = new Schema<IOTP>(
  {
    email: { 
      type: String, 
      required: true, 
      index: true,
      lowercase: true,
      trim: true
    },
    otp: { 
      type: String, 
      required: true 
    },
    expiresAt: { 
      type: Date, 
      required: true,
      index: { expires: 0 } // TTL index: MongoDB will delete the document at this exact time
    },
    attempts: { 
      type: Number, 
      default: 0 
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    },
  }
);

export const OTP: Model<IOTP> = mongoose.models.OTP || mongoose.model<IOTP>("OTP", OTPSchema);
