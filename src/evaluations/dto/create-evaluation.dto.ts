import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateEvaluationDto {
  @ApiProperty({ description: 'Trajet évalué (un seul avis par trajet)', format: 'uuid' })
  @IsString()
  trajetId!: string;

  @ApiProperty({ description: 'Passager qui évalue (doit être le passager rattaché au trajet)', format: 'uuid' })
  @IsString()
  passagerId!: string;

  @ApiProperty({ description: 'Note en étoiles', example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  note!: number;

  @ApiPropertyOptional({
    description: 'Tags rapides sélectionnés par le passager',
    example: ['Conduite prudente', 'Trajet direct', 'Poli'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Commentaire libre', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  commentaire?: string;
}
