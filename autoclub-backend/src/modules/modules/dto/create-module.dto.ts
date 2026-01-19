import { IsNotEmpty, IsString } from 'class-validator'; // <--- AGREGA ESTO

export class CreateModuleDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}