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
import { LicenseCategoriesModule } from './modules/license-categories/license-categories.module';
import { StudentsModule } from './modules/students/students.module';
import { RolesModule } from './modules/roles/roles.module';
import { UsersModule } from './modules/users/users.module';


@Module({
  imports: [
    PrismaModule, 
    AuthModule, 
    ClassesModule, 
    ReservationsModule, 
    ProfessorsModule, 
    SubjectsModule, 
    SchedulesModule, 
    LicenseCategoriesModule, 
    StudentsModule, 
    RolesModule, 
    UsersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}