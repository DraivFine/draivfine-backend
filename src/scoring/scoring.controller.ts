import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Scores')
@Controller({ path: 'scores', version: '1' })
export class ScoringController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('trajet/:trajetId')
  @ApiOperation({
    summary: 'Score comportemental calculé pour un trajet',
    description:
      "Le calcul est asynchrone (queue BullMQ) : peut être null juste après la fin d'un trajet, le temps que le worker de scoring s'exécute.",
  })
  @ApiParam({ name: 'trajetId', description: 'Identifiant du trajet' })
  @ApiResponse({ status: 200, description: 'Score (avec ses alertes) ou null si pas encore calculé' })
  parTrajet(@Param('trajetId') trajetId: string) {
    return this.prisma.score.findUnique({
      where: { trajetId },
      include: { alertes: true },
    });
  }
}
