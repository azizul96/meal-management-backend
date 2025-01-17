import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create a new task
export const createTask = async (req: Request, res: Response) => {
  const { name, description, assignedToId, groupId } = req.body;

  // Validate request body
  if (!name || !assignedToId || !groupId) {
    return res.status(400).json({
      error: "Required fields: name, assignedToId, and groupId.",
    });
  }

  try {
    const task = await prisma.task.create({
      data: {
        name,
        description, // This can be null if optional
        assignedTo: { connect: { id: assignedToId } },
        group: { connect: { id: groupId } },
      },
    });

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create task" });
  }
};
