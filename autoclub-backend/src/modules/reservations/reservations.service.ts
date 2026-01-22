import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  // --- 1. MÉTODO PÚBLICO (Lo usa el estudiante) ---
  async create(createReservationDto: CreateReservationDto, userId: number) {
    const student = await this.prisma.student.findUnique({ where: { user_id: userId } });
    if (!student) throw new BadRequestException('El usuario no es un estudiante activo.');
    
    // Llamamos al motor central pasando el ID del estudiante encontrado
    return this.registerStudent(student.id, createReservationDto.class_id);
  }

  // --- 2. MÉTODO ADMIN (Lo usa el panel administrativo) ---
  async createByAdmin(studentId: number, classId: number) {
    // Validamos que el estudiante exista
    const student = await this.prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Estudiante no encontrado');

    return this.registerStudent(studentId, classId);
  }

  // --- 3. MOTOR CENTRAL DE RESERVAS (Privado) ---
  private async registerStudent(studentId: number, classId: number) {
    return this.prisma.$transaction(async (tx) => {
      // A. Buscar clase
      const classSession = await tx.class.findUnique({
        where: { id: classId },
        include: { subject: true }
      });

      if (!classSession) throw new NotFoundException('La clase no existe');

      // B. Validar Cupo
      if (classSession.available_capacity <= 0) {
        throw new BadRequestException('La clase ya está llena.');
      }

      // C. Validar Materia Repetida
      const subjectAlreadyTaken = await tx.reservation.findFirst({
        where: {
          student_id: studentId,
          status: 'ACTIVE',
          class: { subject_id: classSession.subject_id },
          attendance: { not: false } 
        }
      });

      if (subjectAlreadyTaken) {
        throw new BadRequestException(
          `El estudiante ya tiene inscrita o aprobada la materia: ${classSession.subject.name}.`
        );
      }

      // D. Crear Reserva
      const reservation = await tx.reservation.create({
        data: {
          student_id: studentId,
          class_id: classId,
          status: 'ACTIVE',
          attendance: null
        }
      });

      // E. Restar cupo
      await tx.class.update({
        where: { id: classId },
        data: { available_capacity: { decrement: 1 } }
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