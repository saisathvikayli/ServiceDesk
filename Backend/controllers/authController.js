import User from "../models/User.js";
import jwt from "jsonwebtoken";

const signToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || "secretkey", {
  expiresIn: "7d",
});

export const register = async (req, res) => {
  try {
    const { name, email, passwordHash, role, departmentId } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, passwordHash, role, departmentId });
    const token = signToken(user);

    res.status(201).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, passwordHash } = req.body;
    const user = await User.findOne({ email, passwordHash });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
