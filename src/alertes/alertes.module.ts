import { Module } from '@nestjs/common';
import { AlertesService } from './alertes.service';
import { AlertesController } from './alertes.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [NotificationsModule, RealtimeModule],
  controllers: [AlertesController],
  providers: [AlertesService],
  exports: [AlertesService],
})
export class AlertesModule {}
