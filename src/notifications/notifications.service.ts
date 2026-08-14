import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service de notifications. SMS via Twilio (ou Africa's Talking en repli
 * régional) pour l'urgence — envoyé même sans data mobile côté conducteur,
 * puisque c'est le backend qui déclenche le SMS, pas le téléphone du
 * conducteur. Push via FCM pour les gestionnaires de flotte connectés.
 *
 * Intégration réelle des SDK Twilio / Africa's Talking / firebase-admin à
 * brancher ici — squelette volontairement minimal pour ne pas figer un choix
 * de librairie avant la mise en place des comptes fournisseurs.
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly config: ConfigService) {}

  async envoyerSms(destinataire: string, message: string): Promise<void> {
    const provider = this.config.get<string>('sms.provider');
    this.logger.log(`[SMS via ${provider}] à ${destinataire} : ${message}`);
    // TODO: brancher le SDK Twilio (this.config.get('sms.twilio'))
    // ou Africa's Talking (this.config.get('sms.africasTalking')) ici.
  }

  async envoyerPush(tokenAppareil: string, titre: string, corps: string): Promise<void> {
    this.logger.log(`[Push FCM] à ${tokenAppareil} : ${titre} — ${corps}`);
    // TODO: brancher firebase-admin (this.config.get('fcm')) ici.
  }
}
