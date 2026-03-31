<<<<<<< HEAD
=======
import { randomBytes } from "crypto";

>>>>>>> feature/ui-updates
export function generateOtp(length = 6) {
  // Generates a numeric OTP of given length
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}
