import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase, isValidObjectId } from "@/lib/db";
import { User } from "@/models/User";
import { updateProfileSchema } from "@/lib/validations/auth";

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

    const { name, image } = validation.data;

    await connectToDatabase();

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: { name, image } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
      },
    });
  } catch (error) {
    console.error("Profile Update API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
