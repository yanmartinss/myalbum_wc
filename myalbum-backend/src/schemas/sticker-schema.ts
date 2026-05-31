import { z } from "zod";

export const stickerCodeSchema = z.object({
    code: z.string().min(3).max(5).trim().toUpperCase(), 
});