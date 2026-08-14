import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { TrajetsService } from './trajets.service';
import { DemarrerTrajetDto } from './dto/demarrer-trajet.dto';
import { TerminerTrajetDto } from './dto/terminer-trajet.dto';

@Controller({ path: 'trajets', version: '1' })
export class TrajetsController {
  constructor(private readonly trajetsService: TrajetsService) {}

  @Post('demarrer')
  demarrer(@Body() dto: DemarrerTrajetDto) {
    return this.trajetsService.demarrer(dto);
  }

  @Patch(':id/terminer')
  terminer(@Param('id') id: string, @Body() dto: TerminerTrajetDto) {
    return this.trajetsService.terminer(id, dto);
  }

  @Get()
  findAll(@Query('conducteurId') conducteurId?: string) {
    return this.trajetsService.findAll(conducteurId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trajetsService.findOne(id);
  }
}
