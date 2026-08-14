import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TypeVehicule } from '@prisma/client';

export class CreateVehiculeDto {
  @IsString()
  conducteurId: string;

  @IsString()
  immatriculation: string;

  @IsEnum(TypeVehicule)
  type: TypeVehicule;

  @IsOptional()
  @IsString()
  marque?: string;

  @IsOptional()
  @IsString()
  modele?: string;
}
