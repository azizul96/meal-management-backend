import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient();

// Create a meal plan
export const createMealPlan = async (req: AuthRequest, res: Response) => {
  const { name, date, groupId } = req.body;

  try {
    const meal = await prisma.meal.create({
      data: {
        name,
        date: new Date(date),
        createdById: req.user?.id!,
        groupId,
      },
    });

    res.status(201).json(meal);
  } catch (error) {
    res.status(500).json({ error: "Failed to create meal plan" });
  }
};

// Get meals for a group
export const getGroupMeals = async (req: Request, res: Response) => {
  const { groupId } = req.params;

  try {
    const meals = await prisma.meal.findMany({
      where: { groupId: Number(groupId) },
    });

    res.json(meals);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch meals" });
  }
};
