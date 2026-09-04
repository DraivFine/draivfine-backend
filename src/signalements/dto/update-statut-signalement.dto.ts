import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { StatutSignalement } from '@prisma/client';

export class UpdateStatutSignalementDto {
  @ApiProperty({ enum: StatutSignalement, description: 'Nouveau statut du signalement' })
  @IsEnum(StatutSignalement)
  statut!: StatutSignalement;
}
