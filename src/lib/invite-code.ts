import crypto from "crypto";

export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Omit ambiguous 0, O, 1, I
  let result = "DOC-";
  const randomBytes = crypto.randomBytes(8);

  for (let i = 0; i < 8; i++) {
    result += chars[randomBytes[i] % chars.length];
  }

  return result;
}
