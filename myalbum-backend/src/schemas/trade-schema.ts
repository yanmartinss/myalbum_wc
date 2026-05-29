import z from "zod";

export const tradeItemSchema = z.object({
  code: z.string().min(3).max(5).trim().toUpperCase(),
  quantidade: z.number().int().positive().default(1),
});

export const tradeSchema = z.object({
  giving: z.array(tradeItemSchema).min(1, "Pelo menos uma figurinha para dar"),
  receiving: z.array(tradeItemSchema).min(1, "Pelo menos uma figurinha para receber"),
});
