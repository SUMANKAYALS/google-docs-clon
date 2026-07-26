import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/auth";
import { connectToDatabase, isValidObjectId } from "@/lib/db";
import { User } from "@/models/User";
import { DocumentModel } from "@/models/Document";
import { updateProfileSchema } from "@/lib/validations/auth";

export const dynamic = "force-dynamic";

export async function GET() {

  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isValidObjectId(session.user.id)) {
      return NextResponse.json({ error: "Invalid User Session ID" }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findById(session.user.id).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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

    return NextResponse.json({
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
        createdAt: user.createdAt,
        isVerified: user.isVerified ?? false,
      },
      statistics: {
        documentsCount,
        sharedDocsCount,
        collaboratorsCount,
      }
    });
  } catch (error) {
    console.error("Profile GET API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isValidObjectId(session.user.id)) {
      return NextResponse.json({ error: "Invalid User Session ID" }, { status: 400 });
    }

    const body = await req.json();
    const validation = updateProfileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
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
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        image: updatedUser.image || "",
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
        isVerified: updatedUser.isVerified ?? false,
      },
    });
  } catch (error) {
    console.error("Profile Update API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
