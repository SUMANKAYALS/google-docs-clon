import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST || "smtp.gmail.com",
//   port: parseInt(process.env.SMTP_PORT || "587"),
//   secure: process.env.SMTP_PORT === "465",
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });


// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST || "smtp.gmail.com",
//   port: Number(process.env.SMTP_PORT || "587"),
//   secure: Number(process.env.SMTP_PORT) === 465,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// export async function sendOTPEmail(email: string, otp: string) {
//   const mailOptions = {
//     from: `"Clouds Docs" <${process.env.SMTP_USER}>`,
//     to: email.toLowerCase(),
//     subject: "Verify Your Email",
//     text: `Your verification code is: ${otp}. The code expires in 10 minutes. If you didn't request this, ignore this email.`,
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff; color: #1f2937;">
//         <div style="text-align: center; margin-bottom: 24px; border-bottom: 1px solid #f3f4f6; padding-bottom: 16px;">
//           <h2 style="color: #2563eb; margin: 0; font-size: 24px;">Verify Your Email</h2>
//         </div>
//         <p style="font-size: 15px; line-height: 1.5; color: #4b5563;">Thank you for signing up for Clouds Docs! To verify your email address, please use the One-Time Password (OTP) below:</p>
//         <div style="text-align: center; margin: 32px 0;">
//           <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1e3a8a; background-color: #eff6ff; padding: 12px 24px; border-radius: 8px; border: 1px solid #bfdbfe; display: inline-block;">
//             ${otp}
//           </span>
//         </div>
//         <p style="font-size: 14px; line-height: 1.5; color: #ef4444; font-weight: 500; margin: 0 0 20px 0;">This verification code is valid for 10 minutes and can only be used once.</p>
//         <p style="font-size: 14px; line-height: 1.5; color: #4b5563; margin: 0;">If you did not request this verification, please ignore this email.</p>
//         <div style="text-align: center; margin-top: 32px; border-top: 1px solid #f3f4f6; padding-top: 16px; font-size: 12px; color: #9ca3af;">
//           &copy; 2026 Clouds Docs. All rights reserved.
//         </div>
//       </div>
//     `,
//   };

//   return transporter.sendMail(mailOptions);
// }


export async function sendOTPEmail(email: string, otp: string) {
  try {
    console.log("Checking SMTP connection...");

    await transporter.verify();

    console.log("✅ SMTP server is ready");

    const info = await transporter.sendMail({
      from: `"Clouds Docs" <${process.env.SMTP_USER}>`,
      to: email.toLowerCase(),
      subject: "Verify Your Email",
      text: `Your verification code is: ${otp}`,
      html: `...`,
    });

    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw error;
  }
}