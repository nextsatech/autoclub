import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // <--- Importar

export class CreateClassDto {
  @ApiProperty({ example: 'Clase de Reversa', description: 'Título de la sesión' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: '2026-02-15T00:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  class_date: string;

  @ApiProperty({ example: '2026-02-15T08:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  start_time: string;

  @ApiProperty({ example: '2026-02-15T10:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  end_time: string;

  @ApiProperty({ example: 10, description: 'Cupo máximo de estudiantes' })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  max_capacity: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  professor_id: number;
}