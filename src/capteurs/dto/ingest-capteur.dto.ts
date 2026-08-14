import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class PointCapteurDto {
  @ApiProperty({ description: 'Horodatage ISO 8601 du point de mesure' })
  @IsDateString()
  horodatage: string;

  @ApiProperty({ example: 3.8925 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 11.5213 })
  @IsNumber()
  longitude: number;

  @ApiPropertyOptional({ description: 'Vitesse instantanée en km/h' })
  @IsOptional()
  @IsNumber()
  vitesse?: number;

  @ApiPropertyOptional({ description: 'Accélération instantanée en m/s²' })
  @IsOptional()
  @IsNumber()
  acceleration?: number;

  @ApiPropertyOptional({ description: 'Gyroscope — axe X' })
  @IsOptional()
  @IsNumber()
  gyroscopeX?: number;

  @ApiPropertyOptional({ description: 'Gyroscope — axe Y' })
  @IsOptional()
  @IsNumber()
  gyroscopeY?: number;

  @ApiPropertyOptional({ description: 'Gyroscope — axe Z' })
  @IsOptional()
  @IsNumber()
  gyroscopeZ?: number;
}

// Le mobile envoie un batch de points toutes les X secondes plutôt qu'un
// point à la fois — cf. réglages de batching côté app React Native.
export class IngestCapteurDto {
  @ApiProperty({ description: 'Trajet auquel rattacher ce batch de mesures', format: 'uuid' })
  @IsString()
  trajetId: string;

  @ApiProperty({ description: 'Batch de points capteur (accéléromètre/GPS)', type: [PointCapteurDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PointCapteurDto)
  points: PointCapteurDto[];
}
