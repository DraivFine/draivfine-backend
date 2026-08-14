import { Module } from '@nestjs/common';
import { PassagersService } from './passagers.service';
import { PassagersController } from './passagers.controller';

@Module({
  controllers: [PassagersController],
  providers: [PassagersService],
  exports: [PassagersService],
})
export class PassagersModule {}
