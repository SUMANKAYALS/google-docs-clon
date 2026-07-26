import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { OTP } from "@/models/OTP";
import { registerSchema } from "@/lib/validations/auth";
import { sendOTPEmail } from "@/lib/mail";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {

  try {
    const body = await req.json();

    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data;
    const lowerEmail = email.toLowerCase();

    await connectToDatabase();

    // Check if account already exists
    const existingUser = await User.findOne({ email: lowerEmail });
    if (existingUser) {
      if (existingUser.isVerified) {
        return NextResponse.json(
          { error: "An account with this email address already exists" },
          { status: 409 }
        );
      } else {
        // If they register again with an unverified email, overwrite their info
        const hashedPassword = await bcrypt.hash(password, 12);
        existingUser.name = name;
        existingUser.password = hashedPassword;
        await existingUser.save();
      }
    } else {
      // Create new unverified user
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

    // Generate random 6-digit numeric OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the OTP securely
    const hashedOtp = await bcrypt.hash(generatedOtp, 10);

    // Delete any existing OTP entries for this email
    await OTP.deleteMany({ email: lowerEmail });

    // Store hashed OTP in database with a 10-minute expiry
    const tenMinutes = 10 * 60 * 1000;
    await OTP.create({
      email: lowerEmail,
      otp: hashedOtp,
      expiresAt: new Date(Date.now() + tenMinutes),
      attempts: 0,
      createdAt: new Date(),
    });

    // Dispatch the email containing the code
    try {
      await sendOTPEmail(lowerEmail, generatedOtp);
    } catch (mailError) {
      console.error("Nodemailer dispatch error:", mailError);
      return NextResponse.json(
        { error: "Failed to send email verification code. Please check your SMTP settings." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "A verification code has been sent to your email. Please verify your account.",
        email: lowerEmail
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("User Registration API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
