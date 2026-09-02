import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, MinLength } from 'class-validator';

export class ReinitialiserMotDePasseDto {
  @ApiProperty({
    description: "E-mail (gestionnaire/admin) ou numéro de téléphone (conducteur/passager, avec ou sans indicatif +237)",
    example: 'nom@flotte.cm',
  })
  @IsString()
  @IsNotEmpty()
  identifiant!: string;

  @ApiProperty({ description: 'Code à 6 chiffres reçu par SMS ou e-mail', example: '123456' })
  @IsString()
  @Length(6, 6)
  code!: string;

  @ApiProperty({ description: 'Nouveau mot de passe (8 caractères minimum)', minLength: 8 })
  @MinLength(8)
  nouveauMotDePasse!: string;
}
