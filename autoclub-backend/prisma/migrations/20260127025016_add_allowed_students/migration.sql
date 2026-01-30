-- CreateTable
CREATE TABLE "AllowedStudent" (
    "id" SERIAL NOT NULL,
    "document_number" TEXT NOT NULL,
    "full_name" TEXT,
    "is_registered" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AllowedStudent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AllowedStudent_document_number_key" ON "AllowedStudent"("document_number");
