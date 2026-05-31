import { prisma } from "../../lib/prisma.js";

export const incrementUserSticker = async (userId: string, code: string) => {
    const sticker = await prisma.sticker.findUnique({ where: { code } });
    if (!sticker) return null;
    

    const userSticker = await prisma.userSticker.findUnique({ where: { userId_stickerId: { userId, stickerId: sticker.id } } });
    if (userSticker) {
        return prisma.userSticker.update({ where: { id: userSticker.id }, data: { quantidade: userSticker.quantidade + 1 } });
    }

    return prisma.userSticker.create({
        data: { userId, stickerId: sticker.id, code: sticker.code, quantidade: 1 },
    });
}

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