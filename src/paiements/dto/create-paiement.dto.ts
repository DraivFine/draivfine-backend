import { IsEnum, IsNumber, IsPhoneNumber, IsString, Min } from 'class-validator';
import { OperateurPaiement } from '@prisma/client';

export class CreatePaiementDto {
  @IsString()
  abonnementId: string;

  @IsEnum(OperateurPaiement)
  operateur: OperateurPaiement;

  @IsNumber()
  @Min(1)
  montant: number;

  @IsPhoneNumber()
  telephone: string;
}
