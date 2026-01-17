import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLicenseCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string; // Ej: "C3"
}