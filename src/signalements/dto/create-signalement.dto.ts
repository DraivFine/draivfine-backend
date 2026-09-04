import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class CreateSignalementDto {
  @ApiProperty({ description: 'Latitude GPS du signalement', example: 3.8925 })
  @IsNumber()
  latitude!: number;

  @ApiProperty({ description: 'Longitude GPS du signalement', example: 11.5213 })
  @IsNumber()
  longitude!: number;

  @ApiPropertyOptional({ description: "Description de ce qui a été observé" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Numéro de téléphone du témoin, pour un éventuel rappel' })
  @IsOptional()
  @IsPhoneNumber()
  telephoneTemoin?: string;

  @ApiPropertyOptional({
    description:
      "Plaque d'immatriculation relevée par le témoin — utilisée en best-effort pour relier le signalement au véhicule/conducteur ; ignorée si aucun véhicule ne correspond",
    example: 'CE 1234 AB',
  })
  @IsOptional()
  @IsString()
  immatriculation?: string;

  @ApiPropertyOptional({
    description:
      'Badge conducteur scanné par le témoin — utilisé en best-effort pour relier le signalement au conducteur ; ignoré si aucun conducteur ne correspond',
  })
  @IsOptional()
  @IsString()
  badgeConducteur?: string;

  @ApiPropertyOptional({
    description: "Trajet en cours au moment du signalement, si connu (ex. passager signalant depuis l'app)",
    format: 'uuid',
  })
  @IsOptional()
  @IsString()
  trajetId?: string;
}
