import { IsNumber, IsOptional, IsString } from 'class-validator';

export class DeclencherUrgenceDto {
  @IsString()
  conducteurId: string;

  @IsOptional()
  @IsString()
  trajetId?: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}
