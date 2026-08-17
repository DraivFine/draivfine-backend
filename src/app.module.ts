import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule } from '@nestjs/throttler';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { ConducteursModule } from './conducteurs/conducteurs.module';
import { VehiculesModule } from './vehicules/vehicules.module';
import { TrajetsModule } from './trajets/trajets.module';
import { CapteursModule } from './capteurs/capteurs.module';
import { ScoringModule } from './scoring/scoring.module';
import { AlertesModule } from './alertes/alertes.module';
import { ContactsUrgenceModule } from './contacts-urgence/contacts-urgence.module';
import { AbonnementsModule } from './abonnements/abonnements.module';
import { PaiementsModule } from './paiements/paiements.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RealtimeModule } from './realtime/realtime.module';
import { AuthModule } from './auth/auth.module';
import { UtilisateursModule } from './utilisateurs/utilisateurs.module';
import { PassagersModule } from './passagers/passagers.module';
import { GestionnairesModule } from './gestionnaires/gestionnaires.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),

    // File d'attente Redis (BullMQ) — traitement asynchrone du scoring
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('redis.host'),
          port: config.get<number>('redis.port'),
          password: config.get<string>('redis.password'),
        },
      }),
    }),

    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),

    PrismaModule,
    AuthModule,
    UtilisateursModule,
    PassagersModule,
    GestionnairesModule,
    ConducteursModule,
    VehiculesModule,
    TrajetsModule,
    CapteursModule,
    ScoringModule,
    AlertesModule,
    ContactsUrgenceModule,
    AbonnementsModule,
    PaiementsModule,
    NotificationsModule,
    RealtimeModule,
  ],
})
export class AppModule {}
