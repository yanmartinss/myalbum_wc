import { prisma } from "../../lib/prisma.js";
import { tradeSchema } from "../schemas/trade-schema.js";
import type z from "zod";

export type TradeRequest = z.infer<typeof tradeSchema>;

type RawTrade = Awaited<ReturnType<typeof createTrade>>;

export type FormattedTrade = {
  id: string;
  createdAt: Date;
  giving: Array<{ code: string; quantidade: number }>;
  receiving: Array<{ code: string; quantidade: number }>;
};

export type TradeResult =
  | { ok: true; trade: FormattedTrade }
  | { ok: false; status: 400 | 404; message: string };

const formatTrade = (trade: RawTrade): FormattedTrade => ({
  id: trade.id,
  createdAt: trade.createdAt,
  giving: trade.items
    .filter((i) => i.type === "GIVING")
    .map((i) => ({ code: i.stickerCode, quantidade: i.quantidade })),
  receiving: trade.items
    .filter((i) => i.type === "RECEIVING")
    .map((i) => ({ code: i.stickerCode, quantidade: i.quantidade })),
});

const createTrade = (userId: string, trade: TradeRequest) => {
  const { giving, receiving } = trade;

  return prisma.tradeHistory.create({
    data: {
      userId,
      items: {
        create: [
          ...giving.map((item) => ({
            stickerCode: item.code,
            type: "GIVING",
            quantidade: item.quantidade,
          })),
          ...receiving.map((item) => ({
            stickerCode: item.code,
            type: "RECEIVING",
            quantidade: item.quantidade,
          })),
        ],
      },
    },
    include: {
      items: {
        include: {
          sticker: { select: { code: true, country: true, group: true } },
        },
      },
    },
  });
};

export const performTrade = async (
  userId: string,
  trade: TradeRequest,
): Promise<TradeResult> => {
  const { giving, receiving } = trade;

  const allCodes = [
    ...new Set([
      ...giving.map((i) => i.code),
      ...receiving.map((i) => i.code),
    ]),
  ];

  const existingStickers = await prisma.sticker.findMany({
    where: { code: { in: allCodes } },
    select: { id: true, code: true },
  });

  if (existingStickers.length !== allCodes.length) {
    const existingCodes = new Set(existingStickers.map((s) => s.code));
    const missing = allCodes.filter((c) => !existingCodes.has(c));
    return {
      ok: false,
      status: 404,
      message: `Figurinhas não encontradas: ${missing.join(", ")}`,
    };
  }

  const stickerMap = new Map(existingStickers.map((s) => [s.code, s.id]));

  const userStickers = await prisma.userSticker.findMany({
    where: { userId, stickerId: { in: [...stickerMap.values()] } },
  });

  const userStickerMap = new Map(
    userStickers.map((us) => [us.stickerId, us.quantidade]),
  );

  for (const item of giving) {
    const stickerId = stickerMap.get(item.code)!;
    const owned = userStickerMap.get(stickerId) || 0;
    if (owned < item.quantidade) {
      return {
        ok: false,
        status: 400,
        message: `Você não tem ${item.quantidade}x ${item.code}. Saldo: ${owned}`,
      };
    }
  }

  const tradeRecord = await prisma.$transaction(async (tx) => {
    for (const item of giving) {
      const stickerId = stickerMap.get(item.code)!;
      const userSticker = await tx.userSticker.findUnique({
        where: { userId_stickerId: { userId, stickerId } },
      });

      if (!userSticker) {
        throw new Error(`UserSticker não encontrado para ${item.code}`);
      }

      if (userSticker.quantidade <= item.quantidade) {
        await tx.userSticker.delete({ where: { id: userSticker.id } });
      } else {
        await tx.userSticker.update({
          where: { id: userSticker.id },
          data: { quantidade: { decrement: item.quantidade } },
        });
      }
    }

    for (const item of receiving) {
      const stickerId = stickerMap.get(item.code)!;
      await tx.userSticker.upsert({
        where: { userId_stickerId: { userId, stickerId } },
        update: { quantidade: { increment: item.quantidade } },
        create: {
          userId,
          stickerId,
          code: item.code,
          quantidade: item.quantidade,
        },
      });
    }

    return createTrade(userId, trade);
  });

  return { ok: true, trade: formatTrade(tradeRecord) };
};

export const getUserTradeHistory = async (
  userId: string,
  page: number,
  limit: number,
) => {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.tradeHistory.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            sticker: { select: { code: true, country: true, group: true } },
          },
          orderBy: { type: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.tradeHistory.count({ where: { userId } }),
  ]);

  const formatted = items.map((trade) => ({
    id: trade.id,
    createdAt: trade.createdAt,
    giving: trade.items
      .filter((i) => i.type === "GIVING")
      .map((i) => ({ code: i.stickerCode, quantidade: i.quantidade, sticker: i.sticker })),
    receiving: trade.items
      .filter((i) => i.type === "RECEIVING")
      .map((i) => ({ code: i.stickerCode, quantidade: i.quantidade, sticker: i.sticker })),
    items: trade.items.map((i) => ({
      id: i.id,
      stickerCode: i.stickerCode,
      type: i.type,
      quantidade: i.quantidade,
      sticker: i.sticker,
    })),
  }));

  return {
    items: formatted,
    totalPages: Math.ceil(total / limit) || 0,
  };
};
