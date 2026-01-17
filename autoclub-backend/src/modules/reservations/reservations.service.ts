import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  // 1. CREAR RESERVA (Con regla de unicidad)
  async reserve(userId: number, dto: CreateReservationDto) {

    const studentProfile = await this.prisma.student.findUnique({
      where: { user_id: userId },
    });

    if (!studentProfile) {
      throw new BadRequestException('El usuario no es un estudiante activo.');
    }

    return this.prisma.$transaction(async (tx) => {
    
      const activeReservation = await tx.reservation.findFirst({
        where: {
          student_id: studentProfile.id,
          status: 'ACTIVE', 
        },
   
        include: { 
          class: {
            include: { subject: true }
          } 
        },
      });

      if (activeReservation) {
     
        const className = activeReservation.class.subject?.name || 'Clase sin nombre';
        throw new BadRequestException(
          `Ya tienes una reserva activa en la clase: "${className}". Debes cancelarla antes de reservar otra.`
        );
      }

      // B. Validar Cupo de la nueva clase
      const clase = await tx.class.findUnique({
        where: { id: dto.class_id },
      });

      if (!clase) throw new NotFoundException('La clase no existe');
      
      if (clase.available_capacity <= 0) {
        throw new BadRequestException('¡Lo sentimos! No hay cupos disponibles en esta clase.');
      }

      // C. Crear la nueva reserva
      const reservation = await tx.reservation.create({
        data: {
          class_id: dto.class_id,
          student_id: studentProfile.id,
          status: 'ACTIVE',
        },
      });

      // D. Restar el cupo
      await tx.class.update({
        where: { id: dto.class_id },
        data: { available_capacity: { decrement: 1 } },
      });

      return reservation;
    });
  }

  // 2. CANCELAR RESERVA (Liberar cupo)
  async cancel(userId: number, reservationId: number) {
    const studentProfile = await this.prisma.student.findUnique({
        where: { user_id: userId },
    });


    if (!studentProfile) {
      throw new BadRequestException('El usuario no es un estudiante activo.');
    }


    return this.prisma.$transaction(async (tx) => {
      // A. Buscar la reserva
      const reservation = await tx.reservation.findUnique({
        where: { id: reservationId },
      });

      if (!reservation) throw new NotFoundException('Reserva no encontrada');

      // B. Verificar que la reserva sea de este estudiante
      if (reservation.student_id !== studentProfile.id) {
        throw new BadRequestException('No puedes cancelar una reserva que no es tuya');
      }

      if (reservation.status === 'CANCELLED') {
        throw new BadRequestException('Esta reserva ya fue cancelada previamente');
      }

      // C. Cambiar estado a CANCELLED
      await tx.reservation.update({
        where: { id: reservationId },
        data: { status: 'CANCELLED' },
      });

      // D. DEVOLVER EL CUPO (Sumar 1)
      await tx.class.update({
        where: { id: reservation.class_id },
        data: { available_capacity: { increment: 1 } },
      });

      return { message: 'Reserva cancelada exitosamente. Ahora puedes reservar otra clase.' };
    });
  }

  // 3. VER MIS RESERVAS (Para saber qué ID cancelar)
  async findMyReservations(userId: number) {
    const studentProfile = await this.prisma.student.findUnique({
        where: { user_id: userId },
    });


    if (!studentProfile) {
      throw new BadRequestException('No se encontró perfil de estudiante para este usuario.');
    }
 
    
    return this.prisma.reservation.findMany({
        where: { student_id: studentProfile.id },
        
        include: { 
          class: {
            include: { subject: true }
          } 
        },
        orderBy: { created_at: 'desc' }
    });
  }
}