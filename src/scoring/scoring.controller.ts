import { Controller, Get, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller({ path: 'scores', version: '1' })
export class ScoringController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('trajet/:trajetId')
  parTrajet(@Param('trajetId') trajetId: string) {
    return this.prisma.score.findUnique({
      where: { trajetId },
      include: { alertes: true },
    });
  }
}
