import { IsNotEmpty, IsString, IsDateString, IsBoolean, IsOptional } from 'class-validator';

export class CreateWeeklyScheduleDto {
  @IsNotEmpty()
  @IsString()
  name: string; // Ej: "Semana 1 - Febrero 2026"

  @IsNotEmpty()
  @IsDateString()
  start_date: string; // Lunes

  @IsNotEmpty()
  @IsDateString()
  end_date: string;   // Domingo

  @IsOptional()
  @IsBoolean()
  is_active?: boolean; // Opcional, por defecto será false (Borrador)
}