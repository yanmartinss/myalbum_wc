import type { Request, Response } from "express";
import { registerSchema } from "../schemas/register-schema.js";
import {
  createUser,
  loginUser,
  getUserCollection,
  getStickerGroups,
  getUserById,
  getUserDashboardData,
} from "../services/user.js";
import { loginSchema } from "../schemas/login-schema.js";
import { collectionSchema } from "../schemas/collection-schema.js";

export const register = async (req: Request, res: Response) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: "Invalid data" });
  }

  const { name, email, password } = result.data;

  const user = await createUser(name, email, password);
  if (!user) {
    return res.status(400).json({ error: "User already exists" });
  }

  res.status(201).json({ message: "User registered successfully", user });
};

export const login = async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: "Invalid data" });
  }

  const { email, password } = result.data;

  const token = await loginUser(email, password);
  if (!token) {
    return res.status(401).json({ error: "Access denied" });
  }

  res.status(200).json({ message: "User logged in successfully", token });
};

export const getCollection = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) {
    return res.status(401).json({ error: "Access denied" });
  }

  const query = collectionSchema.safeParse(req.query);
  if (!query.success) {
    return res.status(400).json({ error: "Invalid query params" });
  }

  try {
    const groups = await getStickerGroups();
    const { items, counts } = await getUserCollection(userId, query.data);
    const currentGroup = query.data.group ?? null;
    const currentPage = currentGroup
      ? groups.findIndex((group) => group === currentGroup) + 1
      : null;

    return res.status(200).json({
      items,
      counts,
    });
  } catch (error) {
    console.error("Erro ao carregar coleção:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getCollectionGroups = async (_req: Request, res: Response) => {
  try {
    const groups = await getStickerGroups();
    return res.status(200).json({
      groups,
      totalPages: groups.length,
    });
  } catch (error) {
    console.error("Erro ao carregar grupos:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getMe = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) {
    return res.status(401).json({ error: "Access denied" });
  }

  const user = await getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.status(200).json(user);
};

export const getDashboard = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) {
    return res.status(401).json({ error: "Access denied" });
  }

  const dashboardData = await getUserDashboardData(userId);
  if (!dashboardData) {
    return res.status(404).json({ error: "Error getting dashboard" });
  }

  return res.status(200).json(dashboardData);
};
