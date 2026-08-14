import { Module } from '@nestjs/common';
import { VehiculesService } from './vehicules.service';
import { VehiculesController } from './vehicules.controller';

@Module({
  controllers: [VehiculesController],
  providers: [VehiculesService],
  exports: [VehiculesService],
})
export class VehiculesModule {}
