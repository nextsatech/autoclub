import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsArray, IsNumber } from 'class-validator';

export class CreateSubjectDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_practical?: boolean;

  
  @IsOptional()
  @IsNumber()
  moduleId?: number;

  
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  categoryIds?: number[]; 
}