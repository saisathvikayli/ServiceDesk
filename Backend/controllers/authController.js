import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "servicedesk_static_jwt_secret_key_2026";

// Short-lived access token (set to 1d for development stability)
const signAccessToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, departmentId: user.departmentId },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

const signRefreshToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, departmentId: user.departmentId, type: "refresh" },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = async (req, res) => {
  try {
    const { name, email, role, departmentId } = req.body;
    const password = req.body.password || req.body.passwordHash;

    if (!password || password.length < 8) {
      return res.status(400).json({ message: "password must be at least 8 characters" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role, departmentId });

    const token = signAccessToken(user);
    res.cookie("refreshToken", signRefreshToken(user), refreshCookieOptions);

    user.passwordHash = undefined;
    res.status(201).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email } = req.body;
    const password = req.body.password || req.body.passwordHash;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signAccessToken(user);
    res.cookie("refreshToken", signRefreshToken(user), refreshCookieOptions);

    user.passwordHash = undefined;
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reads the refresh cookie, issues a fresh access token
export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token" });
    }

    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    if (decoded.type !== "refresh") {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    const token = signAccessToken(user);
    res.json({ token });
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};