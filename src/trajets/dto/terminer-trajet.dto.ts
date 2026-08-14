import { IsNumber, IsOptional, Min } from 'class-validator';

export class TerminerTrajetDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  distanceKm?: number;
}
