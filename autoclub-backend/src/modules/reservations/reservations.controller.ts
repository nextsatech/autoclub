import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Controller('reservations')
@UseGuards(AuthGuard('jwt')) // El candado de seguridad para todo el controlador
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  create(@Request() req, @Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.reserve(req.user.userId, createReservationDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.reservationsService.findMyReservations(req.user.userId);
  }

  @Delete(':id')
  cancel(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.reservationsService.cancel(req.user.userId, id);
  }
}