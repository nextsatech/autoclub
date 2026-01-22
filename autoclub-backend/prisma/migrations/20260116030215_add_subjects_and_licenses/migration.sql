/*
  Warnings:

  - You are about to drop the column `title` on the `Class` table. All the data in the column will be lost.
  - Added the required column `subject_id` to the `Class` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Class" DROP COLUMN "title",
ADD COLUMN     "subject_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "license_category_id" INTEGER;

-- CreateTable
CREATE TABLE "LicenseCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "LicenseCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_practical" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_LicenseCategoryToSubject" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "LicenseCategory_name_key" ON "LicenseCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_key" ON "Subject"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_LicenseCategoryToSubject_AB_unique" ON "_LicenseCategoryToSubject"("A", "B");

-- CreateIndex
CREATE INDEX "_LicenseCategoryToSubject_B_index" ON "_LicenseCategoryToSubject"("B");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_license_category_id_fkey" FOREIGN KEY ("license_category_id") REFERENCES "LicenseCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LicenseCategoryToSubject" ADD CONSTRAINT "_LicenseCategoryToSubject_A_fkey" FOREIGN KEY ("A") REFERENCES "LicenseCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LicenseCategoryToSubject" ADD CONSTRAINT "_LicenseCategoryToSubject_B_fkey" FOREIGN KEY ("B") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
