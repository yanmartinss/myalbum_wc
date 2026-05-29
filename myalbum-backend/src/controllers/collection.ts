import type { Request, Response } from "express";
import { stickerCodeSchema } from "../schemas/sticker-schema.js";
import { decrementUserSticker, incrementUserSticker } from "../services/collection.js";

export const increment = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ error: "Access denied" });

    const result = stickerCodeSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: "Invalid data" });

    const { code } = result.data;

    const userSticker = await incrementUserSticker(userId, code);
    if (!userSticker) return res.status(404).json({ error: "Sticker not found" });

   return res.status(200).json({ message: `Sticker ${code} added to collection successfully` });
}

export const decrement = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ error: "Access denied" });

    const result = stickerCodeSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: "Invalid data" });

    const { code } = result.data;

    const userSticker = await decrementUserSticker(userId, code);
    if (!userSticker) return res.status(404).json({ error: "Sticker not found" });

    return res.status(200).json({ message: `Sticker ${code} removed from collection successfully` });
}