import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description:
      "E-mail (gestionnaire/admin) ou numéro de téléphone (conducteur/passager, avec ou sans indicatif +237)",
    example: 'nom@flotte.cm',
  })
  @IsString()
  @IsNotEmpty()
  identifiant!: string;

  @ApiProperty({ description: 'Mot de passe (8 caractères minimum)', minLength: 8 })
  @MinLength(8)
  motDePasse!: string;
}
