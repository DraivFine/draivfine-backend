import { IsOptional, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class CreateConducteurDto {
  @IsString()
  @MinLength(2)
  nom: string;

  @IsPhoneNumber()
  telephone: string;

  @IsOptional()
  @IsString()
  gestionnaireId?: string;
}
