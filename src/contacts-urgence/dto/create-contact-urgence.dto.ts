import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsPhoneNumber, IsString, MinLength } from 'class-validator';
import { TypeContactUrgence } from '@prisma/client';

export class CreateContactUrgenceDto {
  @ApiPropertyOptional({ description: 'Passager auquel rattacher le contact (exclusif avec conducteurId)', format: 'uuid' })
  @IsOptional()
  @IsString()
  passagerId?: string;

  @ApiPropertyOptional({ description: 'Conducteur auquel rattacher le contact (exclusif avec passagerId)', format: 'uuid' })
  @IsOptional()
  @IsString()
  conducteurId?: string;

  @ApiProperty({ description: 'Nom du contact', example: 'Marie Fotso', minLength: 2 })
  @IsString()
  @MinLength(2)
  nom!: string;

  @ApiProperty({ description: 'Numéro de téléphone du contact', example: '+237671223344' })
  @IsPhoneNumber()
  telephone!: string;

  @ApiPropertyOptional({ enum: TypeContactUrgence, description: 'Type de contact (défaut : PERSONNEL)' })
  @IsOptional()
  @IsEnum(TypeContactUrgence)
  type?: TypeContactUrgence;
}
