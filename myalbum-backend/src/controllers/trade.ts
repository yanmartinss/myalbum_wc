import type { Request, Response } from "express";
import { paginationSchema } from "../schemas/pagination-schema.js";
import { tradeSchema } from "../schemas/trade-schema.js";
import { getUserTradeHistory, performTrade } from "../services/trade.js";

export const tradeSticker = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ error: "Access denied" });

    const result = tradeSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: "Invalid data" });

    const tradeResult = await performTrade(userId, result.data);

    if (!tradeResult.ok) {
        return res.status(tradeResult.status).json({ message: tradeResult.message });
    }

    return res.status(200).json({
        message: "Trade registered successfully",
        trade: tradeResult.trade,
    });
};

export const getTradeHistory = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const userId = (req as any).userId;
    if (!userId) {
        res.status(401).json({ error: "Access denied" });
        return;
    }

    const query = paginationSchema.safeParse(req.query);
    if (!query.success) {
        res.status(400).json({ error: "Invalid pagination" });
        return;
    }

    const history = await getUserTradeHistory(
        userId,
        query.data.page,
        query.data.limit,
    );

    res.status(200).json(history);
};