/*
  Warnings:

  - You are about to drop the column `givingStickerCode` on the `TradeHistory` table. All the data in the column will be lost.
  - You are about to drop the column `quantidade` on the `TradeHistory` table. All the data in the column will be lost.
  - You are about to drop the column `receivingStickerCode` on the `TradeHistory` table. All the data in the column will be lost.
  - You are about to drop the `Otp` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Otp" DROP CONSTRAINT "Otp_userId_fkey";

-- DropForeignKey
ALTER TABLE "TradeHistory" DROP CONSTRAINT "TradeHistory_givingStickerCode_fkey";

-- DropForeignKey
ALTER TABLE "TradeHistory" DROP CONSTRAINT "TradeHistory_receivingStickerCode_fkey";

-- AlterTable
ALTER TABLE "TradeHistory" DROP COLUMN "givingStickerCode",
DROP COLUMN "quantidade",
DROP COLUMN "receivingStickerCode";

-- DropTable
DROP TABLE "Otp";

-- CreateTable
CREATE TABLE "TradeItem" (
    "id" TEXT NOT NULL,
    "tradeId" TEXT NOT NULL,
    "stickerCode" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "TradeItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TradeItem" ADD CONSTRAINT "TradeItem_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "TradeHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeItem" ADD CONSTRAINT "TradeItem_stickerCode_fkey" FOREIGN KEY ("stickerCode") REFERENCES "Sticker"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
