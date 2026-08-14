import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class DeclencherUrgenceDto {
  @ApiProperty({ description: 'Conducteur ayant déclenché le bouton d\'urgence', format: 'uuid' })
  @IsString()
  conducteurId: string;

  @ApiPropertyOptional({ description: 'Trajet en cours au moment du déclenchement, si connu', format: 'uuid' })
  @IsOptional()
  @IsString()
  trajetId?: string;

  @ApiProperty({ description: 'Latitude GPS au moment du déclenchement', example: 3.8925 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ description: 'Longitude GPS au moment du déclenchement', example: 11.5213 })
  @IsNumber()
  longitude: number;
}
