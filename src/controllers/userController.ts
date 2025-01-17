import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient();

const generateToken = (id: number, email: string): string => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET as string, {
    expiresIn: "1h",
  });
};

// Register a user
export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    const token = generateToken(newUser.id, newUser.email);

    res
      .status(201)
      .json({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        token,
      });
  } catch (error) {
    res.status(500).json({ error: "Failed to register user" });
  }
};

// Login a user
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(400).json({ error: "Invalid email or password" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ error: "Invalid email or password" });

    const token = generateToken(user.id, user.email);

    res.json({ id: user.id, name: user.name, email: user.email, token });
  } catch (error) {
    res.status(500).json({ error: "Failed to log in user" });
  }
};

// Get user profile
export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
};
