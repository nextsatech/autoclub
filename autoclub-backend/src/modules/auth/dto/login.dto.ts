import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@autoclub.com', description: 'Correo electrónico del usuario' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'admin123', description: 'Contraseña del usuario' })
  @IsString()
  @IsNotEmpty()
  password: string;
}