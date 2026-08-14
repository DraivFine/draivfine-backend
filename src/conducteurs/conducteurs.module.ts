import { Module } from '@nestjs/common';
import { ConducteursService } from './conducteurs.service';
import { ConducteursController } from './conducteurs.controller';

@Module({
  controllers: [ConducteursController],
  providers: [ConducteursService],
  exports: [ConducteursService],
})
export class ConducteursModule {}
