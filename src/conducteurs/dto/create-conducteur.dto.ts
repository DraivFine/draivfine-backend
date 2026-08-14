import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class CreateConducteurDto {
  @ApiProperty({ description: 'Nom complet du conducteur', example: 'Jean Mbarga', minLength: 2 })
  @IsString()
  @MinLength(2)
  nom: string;

  @ApiProperty({ description: 'Numéro de téléphone (identifiant de connexion app mobile)', example: '+237677123456' })
  @IsPhoneNumber()
  telephone: string;

  @ApiProperty({ description: 'Mot de passe du compte (8 caractères minimum)', minLength: 8 })
  @MinLength(8)
  motDePasse: string;

  @ApiPropertyOptional({ description: 'Gestionnaire de flotte qui provisionne ce conducteur', format: 'uuid' })
  @IsOptional()
  @IsString()
  gestionnaireId?: string;
}
