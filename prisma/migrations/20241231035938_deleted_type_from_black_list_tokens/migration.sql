/*
  Warnings:

  - You are about to drop the column `token` on the `black_list_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `black_list_tokens` table. All the data in the column will be lost.
  - Added the required column `tokens` to the `black_list_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "black_list_tokens" DROP COLUMN "token",
DROP COLUMN "type",
ADD COLUMN     "tokens" TEXT NOT NULL;

-- DropEnum
DROP TYPE "TokensTypes";
