import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { OTP } from "@/models/OTP";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {

  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and verification code are required" },
        { status: 400 }
      );
    }

    const lowerEmail = email.trim().toLowerCase();
    await connectToDatabase();

    // 1. Check if user exists
    const user = await User.findOne({ email: lowerEmail }).select("+isVerified");
    if (!user) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      );
    }

    // 2. Fetch OTP record
    const otpRecord = await OTP.findOne({ email: lowerEmail });
    if (!otpRecord) {
      return NextResponse.json(
        { error: "Verification code has expired or is invalid. Please request a new one." },
        { status: 400 }
      );
    }

    // 3. Enforce attempt limits
    if (otpRecord.attempts >= 5) {
      return NextResponse.json(
        { error: "Maximum verification attempts exceeded. Please request a new code." },
        { status: 400 }
      );
    }

    // 4. Enforce expiration limits
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // 5. Compare hashed OTP
    const isMatch = await bcrypt.compare(otp.trim(), otpRecord.otp);
    if (!isMatch) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      const remaining = 5 - otpRecord.attempts;
      const errorMsg = remaining <= 0 
        ? "Maximum verification attempts exceeded. Please request a new code."
        : `Invalid verification code. ${remaining} attempts remaining.`;

      return NextResponse.json(
        { error: errorMsg },
        { status: 400 }
      );
    }

    // 6. Success: Atomically mark user as verified in MongoDB
    const bypassToken = crypto.randomBytes(32).toString("hex");
    const updatedUser = await User.findOneAndUpdate(
      { email: lowerEmail },
      {
        $set: {
          isVerified: true,
          otpBypassToken: bypassToken,
          otpBypassTokenExpires: new Date(Date.now() + 60 * 1000),
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Failed to update user verification status." },
        { status: 500 }
      );
    }

    console.log("[Verify OTP Success] Permanent isVerified=true set in MongoDB for:", lowerEmail);

    // Clean up OTP document
    await OTP.deleteOne({ _id: otpRecord._id });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully!",
      email: updatedUser.email,
      bypassToken,
    });
  } catch (error) {
    console.error("Verify OTP API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
