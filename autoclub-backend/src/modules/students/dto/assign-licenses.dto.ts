import { IsArray, IsNumber } from 'class-validator';

export class AssignLicensesDto {
  @IsArray()
  @IsNumber({}, { each: true })
  categoryIds: number[]; // Ej: [1, 3] para asignar A2 y B1
}