/*
  Warnings:

  - A unique constraint covering the columns `[document_number]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "document_number" TEXT,
ADD COLUMN     "document_type" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_document_number_key" ON "User"("document_number");
