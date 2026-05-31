import { prisma } from "../../lib/prisma.js";
import type { SharedAlbumFilters } from "../schemas/shared-album-schema.js";

const GROUP_SORT_ORDER = (group: string) => {
  if (group === "Especiais") return "A";

  const match = group.match(/^Grupo (.+)$/);
  if (match) return `B-${match[1]}`;

  if (group === "Extras") return "Z";

  return `C-${group}`;
};

export const incrementUserSticker = async (userId: string, code: string) => {
  const sticker = await prisma.sticker.findUnique({ where: { code } });
  if (!sticker) return null;

  const userSticker = await prisma.userSticker.findUnique({
    where: { userId_stickerId: { userId, stickerId: sticker.id } },
  });
  if (userSticker) {
    return prisma.userSticker.update({
      where: { id: userSticker.id },
      data: { quantidade: userSticker.quantidade + 1 },
    });
  }

  return prisma.userSticker.create({
    data: { userId, stickerId: sticker.id, code: sticker.code, quantidade: 1 },
  });
};

export const decrementUserSticker = async (userId: string, code: string) => {
  const sticker = await prisma.sticker.findUnique({ where: { code } });
  if (!sticker) return null;

  const userSticker = await prisma.userSticker.findUnique({
    where: { userId_stickerId: { userId, stickerId: sticker.id } },
  });
  if (!userSticker) return null;

  if (userSticker.quantidade <= 1) {
    await prisma.userSticker.delete({ where: { id: userSticker.id } });
    return { code, quantidade: 0 };
  }

  return prisma.userSticker.update({
    where: { id: userSticker.id },
    data: { quantidade: userSticker.quantidade - 1 },
  });
};

export const getSharedAlbumCollection = async (
  userId: string,
  filters?: SharedAlbumFilters,
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  if (!user) {
    return null;
  }

  const { group, search, page: rawPage, limit: rawLimit } = filters ?? {};
  const page = rawPage ?? 1;
  const limit = rawLimit ?? 72;

  const stickerWhere: {
    group?: string;
    OR?: Array<{
      code?: { contains: string; mode: "insensitive" };
      country?: { contains: string; mode: "insensitive" };
    }>;
  } = {};

  if (group) {
    stickerWhere.group = group;
  }

  if (search) {
    stickerWhere.OR = [
      { code: { contains: search, mode: "insensitive" } },
      { country: { contains: search, mode: "insensitive" } },
    ];
  }

    const [totalStickers, filteredStickers, groups] = await Promise.all([
      prisma.sticker.findMany({
        orderBy: [{ group: "asc" }, { code: "asc" }],
      }),
      prisma.sticker.findMany({
        where: stickerWhere,
        orderBy: [{ group: "asc" }, { code: "asc" }],
      }),
      prisma.sticker.findMany({
        distinct: ["group"],
        select: { group: true },
      }),
    ]);

    const userStickers = await prisma.userSticker.findMany({
      where: { userId },
    });

    const userStickersMap = new Map(
      userStickers.map((us) => [us.stickerId, us.quantidade]),
    );

    const mapItem = (sticker: typeof totalStickers[number]) => ({
      code: sticker.code,
      country: sticker.country,
      group: sticker.group,
      quantidade: userStickersMap.get(sticker.id) || 0,
    });

    const allItems = totalStickers.map(mapItem);
    const total = allItems.length;

    const totalMissing = allItems.filter((i) => i.quantidade === 0).length;
    const totalOwned = allItems.filter((i) => i.quantidade > 0).length;
    const totalDuplicates = allItems.filter((i) => i.quantidade > 1).length;

    if (filteredStickers.length === 0) {
      const sortedGroups = groups
        .map((g) => g.group)
        .sort((a, b) => GROUP_SORT_ORDER(a).localeCompare(GROUP_SORT_ORDER(b)));

      return {
        userName: user.name,
        items: [],
        counts: {
          all: total,
          owned: totalOwned,
          missing: totalMissing,
          duplicates: totalDuplicates,
        },
        groups: sortedGroups,
        totalPages: 1,
        currentPage: 1,
      };
    }

    const sortedItems = filteredStickers
      .map(mapItem)
      .sort((a, b) => {
        const orderA = GROUP_SORT_ORDER(a.group);
        const orderB = GROUP_SORT_ORDER(b.group);
        const groupComparison = orderA.localeCompare(orderB);
        if (groupComparison !== 0) return groupComparison;
        const countryComparison = a.country.localeCompare(b.country);
        if (countryComparison !== 0) return countryComparison;
        return a.code.localeCompare(b.code, undefined, { numeric: true });
      });

    const totalPages = Math.ceil(sortedItems.length / limit) || 1;
    const start = (page - 1) * limit;
    const items = sortedItems.slice(start, start + limit);

    return {
      userName: user.name,
      items,
      counts: {
        all: total,
        owned: totalOwned,
        missing: totalMissing,
        duplicates: totalDuplicates,
      },
      groups: groups
        .map((g) => g.group)
        .sort((a, b) => GROUP_SORT_ORDER(a).localeCompare(GROUP_SORT_ORDER(b))),
      totalPages,
      currentPage: page,
    };
};
