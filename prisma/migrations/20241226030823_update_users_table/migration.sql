-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
