import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClassesModule } from './modules/classes/classes.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { ProfessorsModule } from './modules/professors/professors.module';

@Module({
  imports: [
    PrismaModule, 
    AuthModule, 
    ClassesModule, ReservationsModule, ProfessorsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}