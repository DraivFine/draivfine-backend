import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateAbonnementDto {
  @ApiProperty({ description: 'Identifiant du conducteur qui souscrit', format: 'uuid' })
  @IsString()
  conducteurId: string;

  @ApiProperty({ description: 'Identifiant du plan souscrit', format: 'uuid' })
  @IsString()
  planId: string;
}
