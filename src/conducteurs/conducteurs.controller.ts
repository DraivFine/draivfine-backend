import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ConducteursService } from './conducteurs.service';
import { CreateConducteurDto } from './dto/create-conducteur.dto';
import { UpdateConducteurDto } from './dto/update-conducteur.dto';

@Controller({ path: 'conducteurs', version: '1' })
export class ConducteursController {
  constructor(private readonly conducteursService: ConducteursService) {}

  @Post()
  create(@Body() dto: CreateConducteurDto) {
    return this.conducteursService.create(dto);
  }

  @Get()
  findAll(@Query('gestionnaireId') gestionnaireId?: string) {
    return this.conducteursService.findAll(gestionnaireId);
  }

  @Get('badge/:qrCodeBadge')
  findByBadge(@Param('qrCodeBadge') qrCodeBadge: string) {
    // Utilisé par l'app mobile lors du scan QR pour authentifier le conducteur
    return this.conducteursService.findByBadge(qrCodeBadge);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conducteursService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateConducteurDto) {
    return this.conducteursService.update(id, dto);
  }

  @Patch(':id/regenerer-badge')
  regenererBadge(@Param('id') id: string) {
    return this.conducteursService.regenererBadge(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.conducteursService.remove(id);
  }
}
