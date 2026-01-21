import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  // --- CREAR RESERVA (Con validación de Materia Repetida) ---
  async create(createReservationDto: CreateReservationDto, userId: number) {
    // 1. Obtener al estudiante
    const student = await this.prisma.student.findUnique({
      where: { user_id: userId }
    });

    if (!student) {
      throw new BadRequestException('El usuario no es un estudiante activo.');
    }

    const classId = createReservationDto.class_id;

    return this.prisma.$transaction(async (tx) => {
      // 2. Buscar la clase que quiere reservar
      const classSession = await tx.class.findUnique({
        where: { id: classId },
        include: { subject: true } // Traemos la materia para validar
      });

      if (!classSession) throw new NotFoundException('La clase no existe');

      // 3. Validación de Cupos
      if (classSession.available_capacity <= 0) {
        throw new BadRequestException('La clase ya está llena.');
      }

      // 4. VALIDACIÓN DE MATERIA REPETIDA (TU REQUERIMIENTO)
      // Buscamos si ya tiene alguna reserva activa para ESTA MISMA MATERIA (subject_id)
      const subjectAlreadyTaken = await tx.reservation.findFirst({
        where: {
          student_id: student.id,
          status: 'ACTIVE', // Que no esté cancelada
          class: {
            subject_id: classSession.subject_id // Misma materia
          },
          // Lógica: Si la asistencia es TRUE (La pasó) o NULL (La tiene matriculada/pendiente), BLOQUEAR.
          // Solo permitimos reservar si attendance es FALSE (La perdió y la va a repetir).
          attendance: { not: false } 
        }
      });

      if (subjectAlreadyTaken) {
        throw new BadRequestException(
          `Ya tienes inscrita o aprobada la materia: ${classSession.subject.name}. No puedes volver a tomarla a menos que registres inasistencia.`
        );
      }

      // 5. Crear la reserva
      const reservation = await tx.reservation.create({
        data: {
          student_id: student.id,
          class_id: classId,
          status: 'ACTIVE',
          attendance: null // Por defecto es null (Asistió implícitamente hasta que se diga lo contrario)
        }
      });

      // 6. Restar cupo
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

  // --- CONFIRMAR ASISTENCIA (Solución al Error 500) ---
  async markAttendance(id: number, userId: number, attended: boolean) {
    // 1. Primero buscamos al ESTUDIANTE usando el userId (Token)
    const student = await this.prisma.student.findUnique({
      where: { user_id: userId }
    });

    if (!student) throw new BadRequestException('Estudiante no encontrado');

    // 2. Buscamos la reserva
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: { class: true }
    });

    // 3. Comparamos con el ID del estudiante (NO con el userId)
    if (!reservation || reservation.student_id !== student.id) {
      throw new NotFoundException('Reserva no encontrada o no pertenece al usuario');
    }

    // 4. Validar fecha (Opcional, si quieres ser estricto)
    const classDate = new Date(reservation.class.class_date);
    if (classDate > new Date()) {
       // throw new BadRequestException('No puedes confirmar una clase futura');
    }

    return this.prisma.reservation.update({
      where: { id },
      data: { attendance: attended }
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

      // Validar que no haya pasado la fecha para cancelar
      const classData = await tx.class.findUnique({ where: { id: reservation.class_id }});
      
      // --- CORRECCIÓN AQUÍ: Validamos que la clase exista ---
      if (!classData) throw new NotFoundException('Clase asociada no encontrada'); 

      if (new Date(classData.class_date) < new Date()) {
         throw new BadRequestException('No puedes cancelar una clase que ya pasó. Debes marcar asistencia.');
      }

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