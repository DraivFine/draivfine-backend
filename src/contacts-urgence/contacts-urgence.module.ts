import { Module } from '@nestjs/common';
import { ContactsUrgenceService } from './contacts-urgence.service';
import { ContactsUrgenceController } from './contacts-urgence.controller';

@Module({
  controllers: [ContactsUrgenceController],
  providers: [ContactsUrgenceService],
  exports: [ContactsUrgenceService],
})
export class ContactsUrgenceModule {}
