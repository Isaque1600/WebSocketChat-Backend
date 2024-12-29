-- CreateTable
CREATE TABLE "black_list_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiration_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_ad" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "black_list_tokens_pkey" PRIMARY KEY ("id")
);
