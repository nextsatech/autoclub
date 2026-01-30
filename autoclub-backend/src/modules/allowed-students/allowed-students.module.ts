import { Module } from '@nestjs/common';
import { AllowedStudentsService } from './allowed-students.service';
import { AllowedStudentsController } from './allowed-students.controller';

@Module({
  controllers: [AllowedStudentsController],
  providers: [AllowedStudentsService],
  exports: [AllowedStudentsService],
})
export class AllowedStudentsModule {}
