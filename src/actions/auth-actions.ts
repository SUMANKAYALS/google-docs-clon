"use server";

import { auth } from "@/auth";
import { connectToDatabase, isValidObjectId } from "@/lib/db";
import { User } from "@/models/User";
import { DocumentModel } from "@/models/Document";
import { OTP } from "@/models/OTP";
import { sendOTPEmail } from "@/lib/mail";
import {
  registerSchema,
  updateProfileSchema,
  type RegisterInput,
  type UpdateProfileInput,
} from "@/lib/validations/auth";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export async function registerUserAction(data: RegisterInput) {
  try {
    const validation = registerSchema.safeParse(data);
    if (!validation.success) {
      return { error: validation.error.issues[0].message };
    }

    const { name, email, password } = validation.data;
    const lowerEmail = email.toLowerCase().trim();

    await connectToDatabase();

    const existingUser = await User.findOne({ email: lowerEmail });
    if (existingUser) {
      if (existingUser.isVerified) {
        return { error: "An account with this email address already exists" };
      } else {
        const hashedPassword = await bcrypt.hash(password, 12);
        existingUser.name = name;
        existingUser.password = hashedPassword;
        await existingUser.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 12);
      await User.create({
        name,
        email: lowerEmail,
        password: hashedPassword,
        isVerified: false,
        image: "",
        role: "user",
      });
    }

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(generatedOtp, 10);

    await OTP.deleteMany({ email: lowerEmail });

    const tenMinutes = 10 * 60 * 1000;
    await OTP.create({
      email: lowerEmail,
      otp: hashedOtp,
      expiresAt: new Date(Date.now() + tenMinutes),
      attempts: 0,
      createdAt: new Date(),
    });

    try {
      await sendOTPEmail(lowerEmail, generatedOtp);
    } catch (mailError) {
      console.error("Nodemailer dispatch error:", mailError);
      return { error: "Failed to send email verification code. Please check SMTP settings." };
    }

    return {
      success: true,
      message: "A verification code has been sent to your email. Please verify your account.",
      email: lowerEmail,
    };
  } catch (error) {
    console.error("Register Action Error:", error);
    return { error: "An unexpected error occurred during registration" };
  }
}

export async function getUserProfileAction() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { error: "Unauthorized" };
    }

    if (!isValidObjectId(session.user.id)) {
      return { error: "Invalid User Session ID" };
    }

    await connectToDatabase();

    const user = await User.findById(session.user.id).lean();
    if (!user) {
      return { error: "User not found" };
    }

    const documentsCount = await DocumentModel.countDocuments({ owner: session.user.id, isArchived: false });
    const sharedDocsCount = await DocumentModel.countDocuments({ 
      owner: { $ne: new mongoose.Types.ObjectId(session.user.id) }, 
      "collaboratorMembers.userId": session.user.id,
      isArchived: false 
    });

    const ownedDocs = await DocumentModel.find({ owner: session.user.id });
    const collaboratorsSet = new Set<string>();
    ownedDocs.forEach((doc) => {
      doc.collaboratorMembers?.forEach((member) => {
        collaboratorsSet.add(member.userId.toString());
      });
    });
    const collaboratorsCount = collaboratorsSet.size;

    return {
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name || "",
        email: user.email || "",
        image: user.image || "",
        role: user.role || "user",
        username: user.username || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
        jobTitle: user.jobTitle || "",
        company: user.company || "",
        phoneNumber: user.phoneNumber || "",
        timezone: user.timezone || "",
        language: user.language || "English",
        defaultFont: user.defaultFont || "Inter",
        defaultFontSize: user.defaultFontSize || "16px",
        pageSize: user.pageSize || "Letter",
        autoSaveEnabled: user.autoSaveEnabled !== false,
        aiEnabled: user.aiEnabled !== false,
        twoFactorEnabled: user.twoFactorEnabled === true,
        createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
        isVerified: user.isVerified ?? false,
      },
      statistics: {
        documentsCount,
        sharedDocsCount,
        collaboratorsCount,
      }
    };
  } catch (error) {
    console.error("Get Profile Action Error:", error);
    return { error: "An unexpected error occurred while fetching profile" };
  }
}

export async function updateProfileAction(data: UpdateProfileInput) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { error: "Unauthorized" };
    }

    if (!isValidObjectId(session.user.id)) {
      return { error: "Invalid User Session ID" };
    }

    const validation = updateProfileSchema.safeParse(data);
    if (!validation.success) {
      return { error: validation.error.issues[0].message };
    }

    const { 
      name, image, username, bio, location, website, jobTitle, company,
      phoneNumber, timezone, language, defaultFont, defaultFontSize,
      pageSize, autoSaveEnabled, aiEnabled, twoFactorEnabled
    } = validation.data;

    await connectToDatabase();

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { 
        $set: { 
          name, image, username, bio, location, website, jobTitle, company,
          phoneNumber, timezone, language, defaultFont, defaultFontSize,
          pageSize, autoSaveEnabled, aiEnabled, twoFactorEnabled
        } 
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedUser) {
      return { error: "User not found" };
    }

    return {
      success: true,
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        image: updatedUser.image || "",
        role: updatedUser.role || "user",
        username: updatedUser.username || "",
        bio: updatedUser.bio || "",
        location: updatedUser.location || "",
        website: updatedUser.website || "",
        jobTitle: updatedUser.jobTitle || "",
        company: updatedUser.company || "",
        phoneNumber: updatedUser.phoneNumber || "",
        timezone: updatedUser.timezone || "",
        language: updatedUser.language || "English",
        defaultFont: updatedUser.defaultFont || "Inter",
        defaultFontSize: updatedUser.defaultFontSize || "16px",
        pageSize: updatedUser.pageSize || "Letter",
        autoSaveEnabled: updatedUser.autoSaveEnabled !== false,
        aiEnabled: updatedUser.aiEnabled !== false,
        twoFactorEnabled: updatedUser.twoFactorEnabled === true,
        createdAt: updatedUser.createdAt ? new Date(updatedUser.createdAt).toISOString() : new Date().toISOString(),
        isVerified: updatedUser.isVerified ?? false,
      },
    };
  } catch (error) {
    console.error("Update Profile Action Error:", error);
    return { error: "An unexpected error occurred while updating profile" };
  }
}
