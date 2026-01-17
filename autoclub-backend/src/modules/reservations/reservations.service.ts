import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  async create(createReservationDto: CreateReservationDto, userId: number) {
    const student = await this.prisma.student.findUnique({
      where: { user_id: userId }
    });

    if (!student) {
      throw new BadRequestException('El usuario no es un estudiante activo.');
    }

    const classId = createReservationDto.class_id;

    return this.prisma.$transaction(async (tx) => {
      const classSession = await tx.class.findUnique({
        where: { id: classId }
      });

      if (!classSession) throw new NotFoundException('La clase no existe');

      if (classSession.available_capacity <= 0) {
        throw new BadRequestException('La clase ya está llena.');
      }

      const existingBooking = await tx.reservation.findFirst({
        where: {
          student_id: student.id,
          class_id: classId,
          status: 'ACTIVE'
        }
      });

      if (existingBooking) {
        throw new BadRequestException('Ya tienes una reserva activa para esta clase.');
      }

      const reservation = await tx.reservation.create({
        data: {
          student_id: student.id,
          class_id: classId,
          status: 'ACTIVE'
        }
      });

      await tx.class.update({
        where: { id: classId },
        data: {
          available_capacity: { decrement: 1 }
        }
      });

      return reservation;
    });
  }

  async findAllByStudent(userId: number) {
    const student = await this.prisma.student.findUnique({ where: { user_id: userId } });
    if (!student) return [];

    return this.prisma.reservation.findMany({
      where: { 
        student_id: student.id,
        status: 'ACTIVE' 
      },
      include: {
        class: {
          include: {
            subject: true,
            professor: { include: { user: true } }
          }
        }
      },
      orderBy: { class: { class_date: 'asc' } }
    });
  }

  async cancel(reservationId: number, userId: number) {
    const student = await this.prisma.student.findUnique({ where: { user_id: userId } });
    if (!student) throw new BadRequestException('Estudiante no encontrado');

    return this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findFirst({
        where: { id: reservationId, student_id: student.id }
      });

      if (!reservation) throw new NotFoundException('Reserva no encontrada');
      if (reservation.status !== 'ACTIVE') throw new BadRequestException('Esta reserva ya fue cancelada');

      await tx.reservation.update({
        where: { id: reservationId },
        data: { status: 'CANCELLED' }
      });

      await tx.class.update({
        where: { id: reservation.class_id },
        data: { available_capacity: { increment: 1 } }
      });

      return { message: 'Reserva cancelada exitosamente' };
    });
  }
}