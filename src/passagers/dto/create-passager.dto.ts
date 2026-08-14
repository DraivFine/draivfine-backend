import { ApiProperty } from '@nestjs/swagger';
import { IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class CreatePassagerDto {
  @ApiProperty({ description: 'Nom complet du passager', example: 'Fatou Njoya', minLength: 2 })
  @IsString()
  @MinLength(2)
  nom: string;

  @ApiProperty({ description: 'Numéro de téléphone (identifiant de connexion app mobile)', example: '+237671223344' })
  @IsPhoneNumber()
  telephone: string;

  @ApiProperty({ description: 'Mot de passe du compte (8 caractères minimum)', minLength: 8 })
  @MinLength(8)
  motDePasse: string;
}
