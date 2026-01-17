import { Module } from '@nestjs/common';
import { LicenseCategoriesService } from './license-categories.service';
import { LicenseCategoriesController } from './license-categories.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  controllers: [LicenseCategoriesController],
  providers: [LicenseCategoriesService],
})
export class LicenseCategoriesModule {}
