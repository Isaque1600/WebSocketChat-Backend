-- CreateEnum
CREATE TYPE "TokensTypes" AS ENUM ('ACCESSTOKEN', 'REFRESHTOKEN');

-- AlterTable
ALTER TABLE "black_list_tokens" ADD COLUMN     "type" "TokensTypes" NOT NULL DEFAULT 'ACCESSTOKEN';
