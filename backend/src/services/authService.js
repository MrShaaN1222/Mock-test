import jwt from "jsonwebtoken";
import User from "../models/User.js";
import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";

function signAccessToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role, email: user.email }, env.jwtAccessSecret, {
    expiresIn: "15m"
  });
}

function signRefreshToken(user) {
  return jwt.sign({ sub: user._id.toString() }, env.jwtRefreshSecret, {
    expiresIn: "7d"
  });
}

function toPublicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isBlocked: user.isBlocked
  };
}

export async function register(payload) {
  const name = payload?.name?.trim();
  const email = payload?.email?.trim()?.toLowerCase();
  const password = payload?.password;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, "Email is already registered");
  }

  const user = await User.create({
    name,
    email,
    password,
    role: "student"
  });

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  return {
    user: toPublicUser(user),
    tokens: { accessToken, refreshToken }
  };
}

export async function login(payload) {
  const email = payload?.email?.trim()?.toLowerCase();
  const password = payload?.password;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (user.isBlocked) {
    throw new ApiError(403, "User account is blocked");
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  return {
    user: toPublicUser(user),
    tokens: { accessToken, refreshToken }
  };
}
