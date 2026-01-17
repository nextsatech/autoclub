import { PartialType } from '@nestjs/swagger';
import { CreateLicenseCategoryDto } from './create-license-category.dto';

export class UpdateLicenseCategoryDto extends PartialType(CreateLicenseCategoryDto) {}
