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

    const lowerEmail = email.toLowerCase();
    await connectToDatabase();

    // 1. Check if user exists
    const user = await User.findOne({ email: lowerEmail });
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

    // 3. Enforce attempt limits (rate limit attempts / lock accounts)
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
    const isMatch = await bcrypt.compare(otp, otpRecord.otp);
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

    // 6. Success: Mark user as verified & generate temporary bypass token
    user.isVerified = true;
    const bypassToken = crypto.randomBytes(32).toString("hex");
    user.otpBypassToken = bypassToken;
    user.otpBypassTokenExpires = new Date(Date.now() + 60 * 1000); // 1 minute expiry
    await user.save();

    // Clean up OTP document
    await OTP.deleteOne({ _id: otpRecord._id });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully!",
      email: user.email,
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
