import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TypeVehicule } from '@prisma/client';

export class CreateVehiculeDto {
  @ApiProperty({ description: 'Conducteur propriétaire du véhicule', format: 'uuid' })
  @IsString()
  conducteurId: string;

  @ApiProperty({ description: 'Plaque d\'immatriculation', example: 'CE 341 BF' })
  @IsString()
  immatriculation: string;

  @ApiProperty({ enum: TypeVehicule, description: 'Type de véhicule' })
  @IsEnum(TypeVehicule)
  type: TypeVehicule;

  @ApiPropertyOptional({ example: 'Yamaha' })
  @IsOptional()
  @IsString()
  marque?: string;

  @ApiPropertyOptional({ example: 'YBR 125' })
  @IsOptional()
  @IsString()
  modele?: string;
}
