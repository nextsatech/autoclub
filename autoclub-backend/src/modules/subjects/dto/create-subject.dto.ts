import { IsNotEmpty, IsString, IsArray, IsNumber } from 'class-validator';

export class CreateSubjectDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsArray()
  @IsNumber({}, { each: true })
  categoryIds: number[]; // Ej: [1, 2] significa que aplica para A2 y B1
}