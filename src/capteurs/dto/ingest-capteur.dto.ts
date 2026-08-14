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
  @IsDateString()
  horodatage: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsNumber()
  vitesse?: number;

  @IsOptional()
  @IsNumber()
  acceleration?: number;

  @IsOptional()
  @IsNumber()
  gyroscopeX?: number;

  @IsOptional()
  @IsNumber()
  gyroscopeY?: number;

  @IsOptional()
  @IsNumber()
  gyroscopeZ?: number;
}

// Le mobile envoie un batch de points toutes les X secondes plutôt qu'un
// point à la fois — cf. réglages de batching côté app React Native.
export class IngestCapteurDto {
  @IsString()
  trajetId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PointCapteurDto)
  points: PointCapteurDto[];
}
