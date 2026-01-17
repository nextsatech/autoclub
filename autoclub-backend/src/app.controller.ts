import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service'; // Asegúrate de importar PrismaService
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('dashboard-stats')
  async getStats() {
    const [studentsCount, professorsCount, activeClasses, reservations] = await Promise.all([
      this.prisma.student.count(),
      this.prisma.professor.count(),
      this.prisma.class.count({ where: { status: 'OPEN' } }),
      this.prisma.reservation.count({ where: { status: 'ACTIVE' } })
    ]);

    return {
      students: studentsCount,
      professors: professorsCount,
      activeClasses: activeClasses,
      reservations: reservations
    };
  }
}