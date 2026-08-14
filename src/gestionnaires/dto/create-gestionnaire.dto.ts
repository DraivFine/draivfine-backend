import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

// Pas de champ "role" ici volontairement : cet endpoint n'est pas encore
// protégé par un guard, donc laisser l'appelant choisir son propre rôle
// permettrait de s'auto-attribuer ADMIN. Le rôle est toujours
// GESTIONNAIRE_FLOTTE à la création (cf. GestionnairesService.create).
export class CreateGestionnaireDto {
  @ApiProperty({ description: 'Nom complet du gestionnaire', example: 'Éric Talla', minLength: 2 })
  @IsString()
  @MinLength(2)
  nom: string;

  @ApiProperty({ description: 'E-mail professionnel (identifiant de connexion dashboard)', example: 'nom@flotte.cm' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Mot de passe du compte (8 caractères minimum)', minLength: 8 })
  @MinLength(8)
  motDePasse: string;

  @ApiPropertyOptional({ description: 'Nom de la flotte/entreprise', example: 'Moto Express Yaoundé' })
  @IsOptional()
  @IsString()
  entreprise?: string;
}
