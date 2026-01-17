import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWeeklyScheduleDto } from './dto/create-schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(private prisma: PrismaService) {}

  // 1. Crear una nueva semana
  async create(dto: CreateWeeklyScheduleDto) {
    // Validar que la fecha fin sea después de la fecha inicio
    if (new Date(dto.end_date) < new Date(dto.start_date)) {
      throw new BadRequestException('La fecha de fin no puede ser anterior a la de inicio');
    }

    return this.prisma.weeklySchedule.create({
      data: {
        name: dto.name,
        start_date: new Date(dto.start_date),
        end_date: new Date(dto.end_date),
        is_active: dto.is_active || false, // Por defecto nace oculta
      },
    });
  }

  // 2. Listar todas las semanas (Para el Admin)
  async findAll() {
    return this.prisma.weeklySchedule.findMany({
      orderBy: { start_date: 'desc' }, // Las más nuevas primero
      include: {
        _count: { select: { classes: true } } // Nos dice cuántas clases tiene creadas adentro
      }
    });
  }

  async findOne(id: string) {
    return this.prisma.weeklySchedule.findUnique({
      where: { id },
      include: {
        classes: {
          include: {
            // AQUÍ ESTABA EL FALLO: Faltaba incluir las categorías de la materia
            subject: { 
              include: { categories: true } // <--- AGREGA ESTA LÍNEA CRÍTICA
            },
            professor: {
              include: { user: true }
            }
          }
        }
      }
    });
  }

  async toggleStatus(id: number) {
    const schedule = await this.prisma.weeklySchedule.findUnique({ where: { id } });
    if (!schedule) throw new BadRequestException('Semana no encontrada');

    return this.prisma.weeklySchedule.update({
      where: { id },
      data: { is_active: !schedule.is_active } 
    });
  }

  // 5. Borrar semana (Solo si no tiene clases activas)
  async remove(id: number) {
    return this.prisma.weeklySchedule.delete({ where: { id } });
  }

  async findActive() {
      return this.prisma.weeklySchedule.findMany({
        where: { is_active: true }, // <--- El filtro mágico
        orderBy: { start_date: 'asc' },
        include: {
          _count: { select: { classes: true } }
        }
      });
  }
}