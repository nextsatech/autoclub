import { IsNotEmpty, IsDateString, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateClassDto {
  

  @IsNotEmpty()
  @IsNumber()
  subject_id: number; 

  @IsOptional()
  @IsNumber()
  weekly_schedule_id?: number;

  @IsNotEmpty()
  @IsDateString()
  class_date: string;

  @IsNotEmpty()
  @IsDateString()
  start_time: string;

  @IsNotEmpty()
  @IsDateString()
  end_time: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  max_capacity: number;

  @IsNotEmpty()
  @IsNumber()
  professor_id: number;

  
}