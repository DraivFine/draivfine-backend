import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PlansService } from './plans.service';

@ApiTags('Plans')
@Controller({ path: 'plans', version: '1' })
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les plans actifs, du moins cher au plus cher' })
  @ApiResponse({ status: 200, description: 'Liste des plans actifs' })
  findAll() {
    return this.plansService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: "Détail d'un plan" })
  @ApiParam({ name: 'id', description: 'Identifiant du plan' })
  @ApiResponse({ status: 200, description: 'Plan trouvé' })
  @ApiResponse({ status: 404, description: 'Plan introuvable' })
  findOne(@Param('id') id: string) {
    return this.plansService.findOne(id);
  }
}
