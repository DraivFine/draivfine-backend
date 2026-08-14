import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DemarrerTrajetDto {
  @ApiProperty({ description: 'Conducteur qui démarre le trajet', format: 'uuid' })
  @IsString()
  conducteurId: string;

  @ApiProperty({ description: 'Véhicule utilisé pour ce trajet', format: 'uuid' })
  @IsString()
  vehiculeId: string;
}
