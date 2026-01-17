import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { CreateWeeklyScheduleDto } from './dto/create-schedule.dto';
import { ClassesService } from '../classes/classes.service';

@Controller('schedules')
export class SchedulesController {
  constructor(
    private readonly schedulesService: SchedulesService,
    private readonly classesService: ClassesService
  ) {}

  @Post()
  create(@Body() createScheduleDto: CreateWeeklyScheduleDto) {
    return this.schedulesService.create(createScheduleDto);
  }

  // 1. PRIMERO: Rutas específicas (Fijas)
  @Get('active')
  findActive() {
    return this.schedulesService.findActive();
  }

  @Get()
  findAll() {
    return this.schedulesService.findAll();
  }

  // 2. LUEGO: Rutas dinámicas con ID
  // Si pones :id antes de 'active', NestJS pensará que "active" es un ID.

  @Get(':id/candidates')
  async findCandidates(@Param('id', ParseIntPipe) id: number) {
    const schedule = await this.schedulesService.findOne(id);
    if (!schedule) {
      throw new NotFoundException('La semana solicitada no existe');
    }
    return this.classesService.findUnassignedInRange(schedule.start_date, schedule.end_date);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.schedulesService.findOne(id);
  }

  @Post(':id/assign')
  async assignClasses(
    @Param('id', ParseIntPipe) scheduleId: number,
    @Body('classIds') classIds: number[]
  ) {
    return this.classesService.assignToSchedule(classIds, scheduleId);
  }

  @Patch(':id/toggle')
  toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.schedulesService.toggleStatus(id);
  }

  @Delete('classes/:classId')
  async removeClass(@Param('classId', ParseIntPipe) classId: number) {
    return this.classesService.removeFromSchedule(classId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.schedulesService.remove(id);
  }
}