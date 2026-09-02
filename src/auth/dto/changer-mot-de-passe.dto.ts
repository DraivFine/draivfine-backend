import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangerMotDePasseDto {
  @ApiProperty({ description: 'Mot de passe actuel' })
  @IsString()
  @IsNotEmpty()
  ancienMotDePasse!: string;

  @ApiProperty({ description: 'Nouveau mot de passe (8 caractères minimum)', minLength: 8 })
  @MinLength(8)
  nouveauMotDePasse!: string;
}
