import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  SignupInputSchema,
  LoginInputSchema,
  type AuthConfig,
  type AuthResponse,
} from "@resume-ai/shared";
import { User } from "../models/User.js";
import { env } from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/errors.js";

const router = Router();
const BCRYPT_COST = 12;

function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

router.get("/config", (_req, res) => {
  const response: AuthConfig = { signupDisabled: env.DISABLE_SIGNUP };
  res.status(200).json(response);
});

router.post(
  "/signup",
  asyncHandler(async (req, res) => {
    if (env.DISABLE_SIGNUP) {
      throw new AppError("Signups are currently disabled.", 403);
    }

    const input = SignupInputSchema.parse(req.body);

    const existing = await User.findOne({ email: input.email.toLowerCase() });
    if (existing) {
      throw new AppError("An account with this email already exists.", 409);
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);
    const user = await User.create({
      fullName: input.fullName,
      email: input.email,
      passwordHash,
    });

    const response: AuthResponse = {
      token: signToken(user.id),
      user: { id: user.id, fullName: user.fullName, email: user.email },
    };
    res.status(201).json(response);
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const input = LoginInputSchema.parse(req.body);

    const user = await User.findOne({ email: input.email.toLowerCase() });
    if (!user) {
      throw new AppError("Invalid email or password.", 401);
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new AppError("Invalid email or password.", 401);
    }

    const response: AuthResponse = {
      token: signToken(user.id),
      user: { id: user.id, fullName: user.fullName, email: user.email },
    };
    res.status(200).json(response);
  })
);

export default router;
