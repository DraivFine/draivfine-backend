import { IsEnum } from 'class-validator';
import { StatutAlerte } from '@prisma/client';

export class UpdateStatutAlerteDto {
  @IsEnum(StatutAlerte)
  statut: StatutAlerte;
}
