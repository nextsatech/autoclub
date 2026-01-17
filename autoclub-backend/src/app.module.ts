import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClassesModule } from './modules/classes/classes.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { ProfessorsModule } from './modules/professors/professors.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { SchedulesModule } from './modules/schedules/schedules.module';

@Module({
  imports: [
    PrismaModule, 
    AuthModule, 
    ClassesModule, ReservationsModule, ProfessorsModule, SubjectsModule, SchedulesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}