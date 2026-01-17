import { PartialType } from '@nestjs/mapped-types';
import { CreateWeeklyScheduleDto } from './create-schedule.dto'; // <--- Corregido

export class UpdateScheduleDto extends PartialType(CreateWeeklyScheduleDto) {}