import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateReservationDto {
  @IsInt()
  @IsNotEmpty()
  class_id: number;
}