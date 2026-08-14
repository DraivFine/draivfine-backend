import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface PositionPayload {
  conducteurId: string;
  trajetId?: string;
  latitude: number;
  longitude: number;
}

interface UrgencePayload {
  conducteurId: string;
  trajetId?: string;
  latitude: number;
  longitude: number;
}

/**
 * Gateway temps réel : diffuse la position en direct au dashboard flotte
 * et relaie le déclenchement du bouton d'urgence. La logique de fond du
 * bouton d'urgence (SMS + push + persistance de l'alerte) reste dans
 * AlertesService — ce gateway ne fait que la diffusion websocket.
 */
@WebSocketGateway({ cors: true, namespace: 'realtime' })
export class RealtimeGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  @SubscribeMessage('position:update')
  handlePosition(@MessageBody() payload: PositionPayload, @ConnectedSocket() client: Socket) {
    // Diffusion en direct au dashboard flotte (salle "flotte")
    this.server.to('flotte').emit('position:update', payload);
  }

  @SubscribeMessage('urgence:declencher')
  handleUrgence(@MessageBody() payload: UrgencePayload, @ConnectedSocket() client: Socket) {
    this.logger.warn(`Urgence déclenchée par le conducteur ${payload.conducteurId}`);
    // Diffusion immédiate au dashboard — la persistance + SMS + push est
    // gérée séparément par AlertesService.creerUrgence(), appelé par le
    // contrôleur HTTP alertes/urgence pour garder une trace fiable même
    // si la connexion websocket est instable.
    this.server.to('flotte').emit('urgence:nouvelle', payload);
  }

  @SubscribeMessage('flotte:rejoindre')
  handleJoinFlotte(@ConnectedSocket() client: Socket) {
    client.join('flotte');
  }

  /** Appelé par AlertesService lorsqu'une alerte est persistée en base. */
  diffuserAlerte(alerte: unknown) {
    this.server.to('flotte').emit('alerte:nouvelle', alerte);
  }
}
