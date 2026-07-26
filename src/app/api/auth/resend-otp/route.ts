import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { OTP } from "@/models/OTP";
import { sendOTPEmail } from "@/lib/mail";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
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

    // 2. Check if user is already verified
    if (user.isVerified) {
      return NextResponse.json(
        { error: "This email address is already verified." },
        { status: 400 }
      );
    }

    // 3. Enforce 60-second resend rate limit frequency
    const existingOtp = await OTP.findOne({ email: lowerEmail });
    if (existingOtp) {
      const timeElapsed = Date.now() - new Date(existingOtp.createdAt).getTime();
      if (timeElapsed < 60 * 1000) {
        const waitTime = Math.ceil((60 * 1000 - timeElapsed) / 1000);
        return NextResponse.json(
          { error: `Please wait ${waitTime} seconds before requesting a new code.` },
          { status: 429 }
        );
      }
    }

    // 4. Generate new 6-digit numeric OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(generatedOtp, 10);

    // 5. Invalidate existing codes
    await OTP.deleteMany({ email: lowerEmail });

    // 6. Create new OTP record
    const tenMinutes = 10 * 60 * 1000;
    await OTP.create({
      email: lowerEmail,
      otp: hashedOtp,
      expiresAt: new Date(Date.now() + tenMinutes),
      attempts: 0,
      createdAt: new Date(),
    });

    // 7. Dispatch verification email
    try {
      await sendOTPEmail(lowerEmail, generatedOtp);
    } catch (mailError) {
      console.error("Nodemailer dispatch error:", mailError);
      return NextResponse.json(
        { error: "Failed to send email verification code. Please check your SMTP settings." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "A new verification code has been sent to your email.",
    });
  } catch (error) {
    console.error("Resend OTP API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
