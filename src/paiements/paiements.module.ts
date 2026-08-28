import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaiementsService } from './paiements.service';
import { PaiementsController } from './paiements.controller';
import { GetmepayService } from './getmepay/getmepay.service';

@Module({
  imports: [HttpModule],
  controllers: [PaiementsController],
  providers: [PaiementsService, GetmepayService],
})
export class PaiementsModule {}
