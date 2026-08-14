import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'E-mail du gestionnaire/admin', example: 'nom@flotte.cm' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Mot de passe (8 caractères minimum)', minLength: 8 })
  @MinLength(8)
  motDePasse: string;
}
