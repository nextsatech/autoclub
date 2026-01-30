-- AlterTable
ALTER TABLE "AllowedStudent" ADD COLUMN     "license_category_id" INTEGER;

-- AddForeignKey
ALTER TABLE "AllowedStudent" ADD CONSTRAINT "AllowedStudent_license_category_id_fkey" FOREIGN KEY ("license_category_id") REFERENCES "LicenseCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
