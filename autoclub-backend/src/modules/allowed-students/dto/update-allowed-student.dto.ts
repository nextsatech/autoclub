import { PartialType } from '@nestjs/swagger';
import { CreateAllowedStudentDto } from './create-allowed-student.dto';

export class UpdateAllowedStudentDto extends PartialType(CreateAllowedStudentDto) {}
