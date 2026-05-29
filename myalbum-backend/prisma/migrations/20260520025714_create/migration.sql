/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `UserSticker` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `UserSticker` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserSticker" ADD COLUMN     "code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserSticker_code_key" ON "UserSticker"("code");
