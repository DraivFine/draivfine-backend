import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateContactUrgenceDto } from './create-contact-urgence.dto';

export class UpdateContactUrgenceDto extends PartialType(CreateContactUrgenceDto) {
  @ApiPropertyOptional({ description: "Active/désactive le contact (switch on/off des Paramètres mobile)" })
  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}
