import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class TerminerTrajetDto {
  @ApiPropertyOptional({ description: 'Distance parcourue en km', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  distanceKm?: number;
}
