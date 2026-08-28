import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsPhoneNumber, IsString, Min } from 'class-validator';
import { OperateurPaiement } from '@prisma/client';

export class CreatePaiementDto {
  @ApiProperty({ description: 'Abonnement à payer', format: 'uuid' })
  @IsString()
  abonnementId: string;

  @ApiProperty({ enum: OperateurPaiement, description: 'Opérateur mobile money (routé vers GetMePay)' })
  @IsEnum(OperateurPaiement)
  operateur: OperateurPaiement;

  @ApiProperty({ description: 'Montant en XAF', example: 2000, minimum: 1 })
  @IsNumber()
  @Min(1)
  montant: number;

  @ApiProperty({ description: 'Numéro mobile money du payeur', example: '+237677123456' })
  @IsPhoneNumber()
  telephone: string;
}
