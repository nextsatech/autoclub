import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAllowedStudentDto {
  @IsString()
  @IsNotEmpty()
  document_number: string;

  @IsString()
  @IsOptional()
  full_name?: string;
}