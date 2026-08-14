import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { AbonnementsService } from './abonnements.service';
import { CreateAbonnementDto } from './dto/create-abonnement.dto';

@Controller({ path: 'abonnements', version: '1' })
export class AbonnementsController {
  constructor(private readonly abonnementsService: AbonnementsService) {}

  @Post()
  create(@Body() dto: CreateAbonnementDto) {
    return this.abonnementsService.create(dto);
  }

  @Get()
  findAll(@Query('conducteurId') conducteurId?: string) {
    return this.abonnementsService.findAll(conducteurId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.abonnementsService.findOne(id);
  }

  @Patch(':id/suspendre')
  suspendre(@Param('id') id: string) {
    return this.abonnementsService.suspendre(id);
  }
}
