-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "weekly_schedule_id" INTEGER;

-- CreateTable
CREATE TABLE "WeeklySchedule" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "WeeklySchedule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_weekly_schedule_id_fkey" FOREIGN KEY ("weekly_schedule_id") REFERENCES "WeeklySchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
