import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient();

// Create a group
export const createGroup = async (req: AuthRequest, res: Response) => {
  const { name } = req.body;

  try {
    const group = await prisma.group.create({
      data: {
        name,
        members: { connect: { id: req.user?.id } },
      },
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ error: "Failed to create group" });
  }
};

// Add user to a group
export const addUserToGroup = async (req: AuthRequest, res: Response) => {
  const { groupId, userId } = req.body;

  try {
    const group = await prisma.group.update({
      where: { id: groupId },
      data: { members: { connect: { id: userId } } },
    });

    res.json(group);
  } catch (error) {
    res.status(500).json({ error: "Failed to add user to group" });
  }
};

// Get groups for a user
export const getUserGroups = async (req: AuthRequest, res: Response) => {
  try {
    const groups = await prisma.group.findMany({
      where: { members: { some: { id: req.user?.id } } },
    });

    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch groups" });
  }
};
