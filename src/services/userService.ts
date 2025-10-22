import { UserRepository } from "../repositories/user";
import { type CreateUserInput, type User } from "../types/user";
import { compare, encrypt } from "../utils/auth";
import { CustomError } from "../utils/error";
import { generateToken } from "../utils/token";
import sendEmail from "../utils/sendEmail";
import crypto from "crypto";
import bcrypt from "bcrypt";

class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  getUserById = async (userId: string): Promise<User> => {
    const user = await this.userRepository.findUserById({
      where: { id: userId },
      include: {
        spaces: true,
      },
    });

    if (!user) throw new CustomError("User not found");

    const { spaces, ...userData } = user as any;
    return {
      ...userData,
      spaces: spaces ?? [],
      role: user.role as unknown as User["role"],
    } as User;
  };

  signUp = async (input: CreateUserInput) => {
    const { firstName, lastName, email, password, phone } = input;

    // 1. Check if user already exists by email
    const existingUser = await this.userRepository.findUserByEmail({
      where: { email },
    });
    if (existingUser) {
      throw new CustomError("User with this email already exists");
    }

    // 2. Encrypt password
    const hashedPassword = await encrypt(password);

    // 3. Generate username (firstname + 4 random digits)
    const randomDigits = Math.floor(1000 + Math.random() * 9000); // 4-digit number
    const username = `${firstName.toLowerCase()}${randomDigits}`;

    // 4. Create new user
    const newUser = await this.userRepository.createUser({
      data: {
        firstName,
        lastName,
        email,
        phone: phone ?? null,
        password: hashedPassword,
        username,
      },
    });

    // 5. Generate token
    const token = generateToken(
      { userId: newUser.id },
      process.env.LOGIN_SECRET!,
      "7d",
    );

    return token;
  };

  login = async (identifier: string, password: string) => {
    // Try to find user by email first, then by username if not found
    let user = await this.userRepository.findUserByEmail({
      where: { email: identifier.toLowerCase() },
    });

    if (!user) {
      user = await this.userRepository.findUserByUsername({
        where: { username: identifier },
      });
    }
    if (!user) {
      throw new CustomError("Invalid credentials");
    }

    if (typeof user.password !== "string") {
      throw new CustomError("Invalid credentials");
    }
    const isValid = await compare(password, user.password);
    if (!isValid) {
      throw new CustomError("Invalid credentials");
    }
    const token = generateToken(
      { userId: user.id },
      process.env.LOGIN_SECRET!,
      "7d",
    );

    return token;
  };

  forgotPassword = async (email: string): Promise<string> => {
    // 1️⃣ Find user
    const user = await this.userRepository.findUserByEmail({
      where: { email },
    });
    if (!user) {
      throw new CustomError("User not found");
    }

    // 2️⃣ Generate OTP (6-digit)
    const otp = crypto.randomInt(100000, 999999).toString();
    console.log("Generated OTP:", otp);

    // 3️⃣ Save OTP & expiry (e.g., 10 minutes) to DB
    await this.userRepository.updateUser({
      where: { email },
      data: {
        resetOtp: otp,
        resetOtpExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
      },
    });

    const emailTemplate = `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <h2>Password Reset Request</h2>
           <p>Dear ${user.firstName},</p>
           <p>We received a request to reset your password. Use the following OTP to proceed:</p>
         <h3 style="color: #007bff;">${otp}</h3>
           <p>This OTP is valid for 10 minutes. If you did not request a password reset, please ignore this email.</p>
        <p>Best regards,<br>Hospitality Management Team</p>
        </body>
     </html>
     `;

    // Send OTP email
    await sendEmail(email, "Password Reset OTP", emailTemplate);

    return "OTP has been sent to your email";
  };

  verifyOtp = async (email: string, otp: string): Promise<boolean> => {
    // 1️⃣ Find user by email
    const user = await this.userRepository.findUserByEmail({
      where: { email },
    });
    if (!user) {
      throw new CustomError("User not found");
    }

    // 2️⃣ Check if OTP matches
    if (!user.resetOtp || user.resetOtp !== otp) {
      throw new CustomError("Invalid OTP");
    }

    // 3️⃣ Check expiry
    if (user.resetOtpExpiry && new Date(user.resetOtpExpiry) < new Date()) {
      throw new CustomError("OTP has expired");
    }

    // 4️⃣ If valid, you might want to clear OTP so it can’t be reused
    await this.userRepository.updateUser({
      where: { email },
      data: {
        resetOtp: null,
        resetOtpExpiry: null,
      },
    });

    return true;
  };

  resetPassword = async (
    email: string,
    newPassword: string,
  ): Promise<boolean> => {
    const user = await this.userRepository.findUserByEmail({
      where: { email },
    });
    if (!user) {
      throw new CustomError("User not found");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.userRepository.updateUser({
      where: { email },
      data: {
        password: hashedPassword,
        resetOtp: null,
        resetOtpExpiry: null,
      },
    });

    return true;
  };

  changePassword = async (
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<boolean> => {
    const user = await this.userRepository.findUserById({
      where: { id: userId },
    });
    if (!user) {
      throw new CustomError("User not found");
    }

    if (!user.password || typeof user.password !== "string") {
      throw new CustomError("Invalid user password");
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new CustomError("Old password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update password
    await this.userRepository.updateUser({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return true;
  };
}

export default UserService;
