import { IsEmail, IsNotEmpty, IsString, MinLength, IsArray, IsNumber, IsOptional } from 'class-validator';

export class CreateStudentDto {
  @IsNotEmpty()
  @IsString()
  full_name: string;

  @IsNotEmpty()
  @IsString()
  document_type: string;

  @IsNotEmpty()
  @IsString()
  document_number: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  // --- NUEVO: ROL ---
  @IsNotEmpty()
  @IsNumber()
  role_id: number;
  // ------------------

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  categoryIds?: number[];
}