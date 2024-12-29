/*
  Warnings:

  - A unique constraint covering the columns `[tokens]` on the table `black_list_tokens` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "black_list_tokens_tokens_key" ON "black_list_tokens"("tokens");
