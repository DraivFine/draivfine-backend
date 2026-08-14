import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { StatutAlerte } from '@prisma/client';

export class UpdateStatutAlerteDto {
  @ApiProperty({ enum: StatutAlerte, description: 'Nouveau statut de l\'alerte' })
  @IsEnum(StatutAlerte)
  statut: StatutAlerte;
}
