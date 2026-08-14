import { Module } from '@nestjs/common';
import { PaiementsService } from './paiements.service';
import { PaiementsController } from './paiements.controller';
import { MomoProvider } from './providers/momo.provider';
import { OrangeMoneyProvider } from './providers/orange-money.provider';

@Module({
  controllers: [PaiementsController],
  providers: [PaiementsService, MomoProvider, OrangeMoneyProvider],
})
export class PaiementsModule {}
