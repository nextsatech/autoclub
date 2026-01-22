import { Body, Controller, Get, Patch, Param, ParseIntPipe, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Roles } from '../auth/roles.decorator';

@Controller('reservations')
@UseGuards(AuthGuard('jwt'))
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  create(@Request() req, @Body() createReservationDto: CreateReservationDto) {
    // Solución error 1: El servicio espera (dto, userId)
    return this.reservationsService.create(createReservationDto, req.user.userId);
  }

  @Get('mine')
  findAllMine(@Request() req) {
    // Solución error 2: Usamos el nombre correcto del método del servicio
    return this.reservationsService.findAllByStudent(req.user.userId);
  }

  @Post(':id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number, @Request() req) {
    // Solución error 3 y 4: Un solo método para cancelar
    return this.reservationsService.cancel(id, req.user.userId);
  }

  @Patch(':id/attendance')
  @Roles('student')
  markAttendance(
    @Param('id') id: string,
    @Body('attended') attended: boolean,
    @Request() req,
  ) {
    return this.reservationsService.markAttendance(+id, req.user.userId, attended);
  }

  @Post('admin/create')
  @Roles('admin') // Solo admins
  createByAdmin(@Body() body: { student_id: number; class_id: number }) {
    return this.reservationsService.createByAdmin(body.student_id, body.class_id);
  }
}