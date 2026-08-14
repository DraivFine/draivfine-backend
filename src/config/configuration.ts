export default () => ({
  env: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),

  database: {
    url: process.env.DATABASE_URL,
  },

  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },

  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev_secret_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
  },

  mlService: {
    url: process.env.ML_SERVICE_URL ?? 'http://localhost:8001',
    timeoutMs: parseInt(process.env.ML_SERVICE_TIMEOUT_MS ?? '5000', 10),
    fallbackToHeuristics: process.env.SCORING_FALLBACK_TO_HEURISTICS !== 'false',
  },

  sms: {
    provider: process.env.SMS_PROVIDER ?? 'twilio',
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      fromNumber: process.env.TWILIO_FROM_NUMBER,
    },
    africasTalking: {
      apiKey: process.env.AT_API_KEY,
      username: process.env.AT_USERNAME,
      fromShortcode: process.env.AT_FROM_SHORTCODE,
    },
  },

  fcm: {
    projectId: process.env.FCM_PROJECT_ID,
    clientEmail: process.env.FCM_CLIENT_EMAIL,
    privateKey: process.env.FCM_PRIVATE_KEY,
  },

  momo: {
    apiKey: process.env.MOMO_API_KEY,
    apiUser: process.env.MOMO_API_USER,
    subscriptionKey: process.env.MOMO_SUBSCRIPTION_KEY,
    targetEnv: process.env.MOMO_TARGET_ENV ?? 'sandbox',
  },

  orangeMoney: {
    clientId: process.env.ORANGE_MONEY_CLIENT_ID,
    clientSecret: process.env.ORANGE_MONEY_CLIENT_SECRET,
    merchantKey: process.env.ORANGE_MONEY_MERCHANT_KEY,
  },
});
