import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class DemarrerTrajetDto {
  @ApiProperty({ description: 'Conducteur qui démarre le trajet', format: 'uuid' })
  @IsString()
  conducteurId!: string;

  @ApiProperty({ description: 'Véhicule utilisé pour ce trajet', format: 'uuid' })
  @IsString()
  vehiculeId!: string;

  @ApiPropertyOptional({
    description:
      'Passager qui a scanné le badge du conducteur, si le trajet démarre via ce flux (optionnel : un trajet peut aussi démarrer sans passager identifié)',
    format: 'uuid',
  })
  @IsOptional()
  @IsString()
  passagerId?: string;
}
