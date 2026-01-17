/*
  Warnings:

  - You are about to drop the column `license_category_id` on the `Student` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_license_category_id_fkey";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "license_category_id";

-- CreateTable
CREATE TABLE "_LicenseCategoryToStudent" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_LicenseCategoryToStudent_AB_unique" ON "_LicenseCategoryToStudent"("A", "B");

-- CreateIndex
CREATE INDEX "_LicenseCategoryToStudent_B_index" ON "_LicenseCategoryToStudent"("B");

-- AddForeignKey
ALTER TABLE "_LicenseCategoryToStudent" ADD CONSTRAINT "_LicenseCategoryToStudent_A_fkey" FOREIGN KEY ("A") REFERENCES "LicenseCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LicenseCategoryToStudent" ADD CONSTRAINT "_LicenseCategoryToStudent_B_fkey" FOREIGN KEY ("B") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
