export interface GetmepayAuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    token_format: string;
    token_type: string;
    expires_at: number;
  };
  error_code?: string;
}

export interface GetmepayPayinResult {
  transaction_reference: string;
  soleaspay_reference: string;
  external_reference?: string;
  amount: number;
  fee_amount: number;
  net_amount: number;
  currency: string;
  status: 'processing' | 'success' | 'failed' | 'pending';
  service_used: string;
  service_name: string;
  otp_required: boolean;
  payment_url: string | null;
  webhook_urls: { success: string; failure: string };
}

export interface GetmepayPayinResponse {
  success: boolean;
  message: string;
  data: GetmepayPayinResult;
}

export interface GetmepayStatusResult {
  status: 'processing' | 'success' | 'failed' | 'pending';
  [key: string]: unknown;
}

export interface GetmepayStatusResponse {
  success: boolean;
  message: string;
  data: GetmepayStatusResult;
}

// Payload reçu du webhook GetMePay — interface brute (pas une classe
// class-validator) pour ne pas passer par le ValidationPipe global
// (whitelist/forbidNonWhitelisted) : un payload GetMePay imprévu ne doit
// jamais provoquer une 400 avant même d'atteindre le handler, sous peine de
// déclencher les tentatives de renvoi du fournisseur.
export interface GetmepayWebhookPayload {
  order_id: string;
  soleaspay_reference: string;
  status: string;
  soleaspay_status?: string;
  amount?: number;
}
