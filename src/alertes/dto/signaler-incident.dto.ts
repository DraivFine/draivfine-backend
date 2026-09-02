import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class SignalerIncidentDto {
  @ApiPropertyOptional({
    description: "Conducteur signalant l'incident (exclusif avec passagerId)",
    format: 'uuid',
  })
  @IsOptional()
  @IsString()
  conducteurId?: string;

  @ApiPropertyOptional({
    description: "Passager signalant l'incident (exclusif avec conducteurId)",
    format: 'uuid',
  })
  @IsOptional()
  @IsString()
  passagerId?: string;

  @ApiPropertyOptional({ description: 'Trajet en cours au moment du signalement, si connu', format: 'uuid' })
  @IsOptional()
  @IsString()
  trajetId?: string;

  @ApiPropertyOptional({ description: "Description libre de l'incident" })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ description: 'Latitude GPS au moment du signalement', example: 3.8925 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ description: 'Longitude GPS au moment du signalement', example: 11.5213 })
  @IsNumber()
  longitude: number;
}
