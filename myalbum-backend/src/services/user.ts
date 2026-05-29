import { compare, hash } from "bcryptjs";
import { prisma } from "../../lib/prisma.js";
import jwt from "jsonwebtoken";
import type { CollectionFilters } from "../schemas/collection-schema.js";

export const createUser = async (
  name: string,
  email: string,
  password: string,
) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return null;

  const hashedPassword = await hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!user) return null;

  const validPassword = await compare(password, user.password);
  if (!validPassword) return null;

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET || "KEY_TOKEN",
  );
  return token;
};

export const getUserCollection = async (
  userId: string,
  filters: CollectionFilters = { status: "all" },
) => {
  const status = filters.status ?? "all";

  const stickerWhere: {
    group?: string;
    OR?: Array<{
      code?: { contains: string; mode: "insensitive" };
      country?: { contains: string; mode: "insensitive" };
    }>;
  } = {};

  if (filters.group) {
    stickerWhere.group = filters.group;
  }

  if (filters.search) {
    stickerWhere.OR = [
      { code: { contains: filters.search, mode: "insensitive" } },
      { country: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [allStickers, allStickersUnfiltered, userStickers] = await Promise.all([
    prisma.sticker.findMany({
      where: stickerWhere,
      orderBy: { code: "asc" },
    }),
    prisma.sticker.findMany({
      orderBy: { code: "asc" },
    }),
    prisma.userSticker.findMany({
      where: { userId },
    }),
  ]);

  const userStickersMap = new Map(
    userStickers.map((us) => [us.stickerId, us.quantidade]),
  );

  const collection = allStickers.map((sticker) => ({
    code: sticker.code,
    country: sticker.country,
    group: sticker.group,
    quantidade: userStickersMap.get(sticker.id) || 0,
  }));

  const overallCollection = allStickersUnfiltered.map((sticker) => ({
    quantidade: userStickersMap.get(sticker.id) || 0,
  }));

  const all = collection;
  const missing = collection.filter((item) => item.quantidade === 0);
  const owned = collection.filter((item) => item.quantidade > 0);
  const duplicates = collection.filter((item) => item.quantidade > 1);

  let items: typeof collection;
  if (status === "missing") items = missing;
  else if (status === "owned") items = owned;
  else if (status === "duplicates") items = duplicates;
  else items = all;

  return {
    items,
    counts: {
      all: all.length,
      missing: missing.length,
      owned: owned.length,
      duplicates: duplicates.length,
    },
    overallCounts: {
      all: overallCollection.length,
      missing: overallCollection.filter((item) => item.quantidade === 0).length,
      owned: overallCollection.filter((item) => item.quantidade > 0).length,
      duplicates: overallCollection.filter((item) => item.quantidade > 1).length,
    },
  };
};

const GROUP_SORT_ORDER = (group: string) => {
  if (group === "Especiais") return "0";
  if (group === "Extras") return "2";
  const match = group.match(/^Grupo (.+)$/);
  if (match) return `1-${match[1]}`;
  return `3-${group}`;
};

export const getStickerGroups = async () => {
  const rows = await prisma.sticker.findMany({
    distinct: ["group"],
    select: { group: true },
  });

  return rows
    .map((row) => row.group)
    .sort((a, b) => GROUP_SORT_ORDER(a).localeCompare(GROUP_SORT_ORDER(b)));
};

export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
};

export const getUserDashboardData = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const countStickers = await prisma.sticker.count();
  const collection = await prisma.userSticker.findMany({
    where: { userId },
  });

  const ownedStickers = collection.filter((item) => item.quantidade > 0);
  const totalOwned = ownedStickers.length;

  const totalDuplicates = ownedStickers.reduce((acc, item) => {
    return acc + (item.quantidade > 1 ? item.quantidade - 1 : 0);
  }, 0);

  const totalMissing = countStickers - totalOwned;

  const progressPercentage =
    countStickers > 0
      ? parseFloat(((totalOwned / countStickers) * 100).toFixed(2))
      : 0;

  return {
    countStickers,
    totalOwned,
    totalDuplicates,
    totalMissing,
    progressPercentage,
  };
};
