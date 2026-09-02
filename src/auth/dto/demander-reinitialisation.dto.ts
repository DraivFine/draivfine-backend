import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DemanderReinitialisationDto {
  @ApiProperty({
    description: "E-mail (gestionnaire/admin) ou numéro de téléphone (conducteur/passager, avec ou sans indicatif +237)",
    example: 'nom@flotte.cm',
  })
  @IsString()
  @IsNotEmpty()
  identifiant!: string;
}
