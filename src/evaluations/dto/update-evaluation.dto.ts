import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

// Pas de trajetId/passagerId ici : modifier l'avis d'un passager, oui, mais
// pas le rattacher à un autre trajet ou un autre passager après coup.
export class UpdateEvaluationDto {
  @ApiPropertyOptional({ description: 'Note en étoiles', example: 4, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  note?: number;

  @ApiPropertyOptional({
    description: 'Tags rapides sélectionnés par le passager',
    example: ['Conduite prudente', 'Poli'],
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
