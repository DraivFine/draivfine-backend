import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class TerminerTrajetDto {
  @ApiPropertyOptional({ description: 'Distance parcourue en km', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  distanceKm?: number;

  @ApiPropertyOptional({ description: 'Montant perçu par le conducteur pour ce trajet (XAF)', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  montant?: number;
}
