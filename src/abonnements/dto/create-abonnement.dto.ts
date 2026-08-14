import { IsString } from 'class-validator';

export class CreateAbonnementDto {
  @IsString()
  conducteurId: string;

  @IsString()
  planId: string;
}
