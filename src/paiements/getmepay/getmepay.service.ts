import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, catchError, timeout } from 'rxjs';
import { OperateurPaiement } from '@prisma/client';
import {
  GetmepayAuthResponse,
  GetmepayPayinResponse,
  GetmepayPayinResult,
  GetmepayStatusResponse,
  GetmepayStatusResult,
} from './getmepay.types';

/**
 * Client HTTP vers GetMePay (agrégateur mobile money MTN/Orange, API
 * api.getmipay.com). Authentification par échange clé publique/privée
 * contre un token Bearer mis en cache 12h — pas d'API key statique par
 * requête.
 */
@Injectable()
export class GetmepayService {
  private readonly logger = new Logger(GetmepayService.name);
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private cachedToken: { token: string; expiresAt: number } | null = null;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.baseUrl = this.config.get<string>('getmepay.apiUrl')!;
    this.timeoutMs = this.config.get<number>('getmepay.timeoutMs')!;
  }

  static roundUpToNext50(montant: number): number {
    return Math.ceil(montant / 50) * 50;
  }

  /** 'success'|'failed' → notre enum StatutPaiement ; tout le reste (processing/pending/inconnu) → repli prudent EN_ATTENTE. */
  mapStatutFournisseurToStatutPaiement(statutFournisseur: string): 'EN_ATTENTE' | 'REUSSI' | 'ECHOUE' {
    if (statutFournisseur === 'success') return 'REUSSI';
    if (statutFournisseur === 'failed') return 'ECHOUE';
    return 'EN_ATTENTE';
  }

  private async authenticate(): Promise<string> {
    const { data } = await firstValueFrom(
      this.http
        .post<GetmepayAuthResponse>(`${this.baseUrl}/action/auth`, {
          public_apikey: this.config.get<string>('getmepay.publicApiKey'),
          private_secretkey: this.config.get<string>('getmepay.privateSecretKey'),
        })
        .pipe(
          timeout(this.timeoutMs),
          catchError((err) => {
            this.logger.error(`Échec authentification GetMePay : ${err.message}`);
            throw err;
          }),
        ),
    );

    if (!data?.success || !data.data?.token) {
      throw new Error(data?.message ?? 'Réponse GetMePay invalide (authentification)');
    }

    this.cachedToken = { token: data.data.token, expiresAt: Date.now() + 12 * 60 * 60 * 1000 };
    return this.cachedToken.token;
  }

  private async ensureValidToken(): Promise<string> {
    if (this.cachedToken && Date.now() < this.cachedToken.expiresAt) return this.cachedToken.token;
    return this.authenticate();
  }

  private forceTokenRefresh(): Promise<string> {
    this.cachedToken = null;
    return this.authenticate();
  }

  async payin(params: {
    montant: number;
    telephone: string;
    description: string;
    customerName: string;
    operateur: OperateurPaiement;
    customerEmail?: string;
  }): Promise<GetmepayPayinResult> {
    const montantArrondi = GetmepayService.roundUpToNext50(params.montant);
    const wallet = params.telephone.replace(/\D/g, '');
    const service = params.operateur === 'ORANGE_MONEY' ? '2' : '3';

    const appelPayin = async (token: string) =>
      firstValueFrom(
        this.http
          .post<GetmepayPayinResponse>(
            `${this.baseUrl}/payments/payin`,
            {
              amount: montantArrondi,
              currency: 'XAF',
              wallet,
              description: params.description,
              customer_name: params.customerName,
              customer_email: params.customerEmail,
              callback_url: this.config.get<string>('getmepay.callbackUrl'),
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                operation: '2',
                service,
              },
            },
          )
          .pipe(timeout(this.timeoutMs)),
      );

    let token = await this.ensureValidToken();
    try {
      const { data } = await appelPayin(token);
      if (!data?.success) throw new Error(data?.message ?? 'Payin GetMePay refusé');
      return data.data;
    } catch (err: any) {
      if (err?.response?.status === 401) {
        token = await this.forceTokenRefresh();
        const { data } = await appelPayin(token);
        if (!data?.success) throw new Error(data?.message ?? 'Payin GetMePay refusé');
        return data.data;
      }
      this.logger.error(`Échec payin GetMePay : ${err.message}`);
      throw err;
    }
  }

  async checkStatus(orderId: string, payId: string): Promise<GetmepayStatusResult> {
    const token = await this.ensureValidToken();
    const { data } = await firstValueFrom(
      this.http
        .post<GetmepayStatusResponse>(
          `${this.baseUrl}/payments/direct-status`,
          { order_id: orderId, pay_id: payId },
          { headers: { Authorization: `Bearer ${token}` } },
        )
        .pipe(
          timeout(this.timeoutMs),
          catchError((err) => {
            this.logger.error(`Échec vérification statut GetMePay : ${err.message}`);
            throw err;
          }),
        ),
    );
    return data.data;
  }
}
