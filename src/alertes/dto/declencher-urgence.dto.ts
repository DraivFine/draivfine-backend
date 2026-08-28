import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { TypeAlerte } from '@prisma/client';

export class DeclencherUrgenceDto {
  @ApiProperty({ enum: TypeAlerte, description: "Type de l'alerte déclenchée" })
  @IsEnum(TypeAlerte)
  type: TypeAlerte;

  @ApiPropertyOptional({
    description: "Conducteur ayant déclenché le bouton d'urgence (exclusif avec passagerId)",
    format: 'uuid',
  })
  @IsOptional()
  @IsString()
  conducteurId?: string;

  @ApiPropertyOptional({
    description: "Passager ayant déclenché le bouton d'urgence (exclusif avec conducteurId)",
    format: 'uuid',
  })
  @IsOptional()
  @IsString()
  passagerId?: string;

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
