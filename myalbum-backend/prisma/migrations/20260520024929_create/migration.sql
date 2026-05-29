-- CreateTable
CREATE TABLE "TradeHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "givingStickerCode" TEXT NOT NULL,
    "receivingStickerCode" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TradeHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TradeHistory" ADD CONSTRAINT "TradeHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeHistory" ADD CONSTRAINT "TradeHistory_givingStickerCode_fkey" FOREIGN KEY ("givingStickerCode") REFERENCES "Sticker"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeHistory" ADD CONSTRAINT "TradeHistory_receivingStickerCode_fkey" FOREIGN KEY ("receivingStickerCode") REFERENCES "Sticker"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
