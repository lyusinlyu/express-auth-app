import { config as dotenvConfig } from 'dotenv';
import path from 'path';

dotenvConfig();

const config = {
  port: process.env.PORT,
  db: {
    type: process.env.TYPEORM_TYPE || 'postgres',
    port: process.env.TYPEORM_PORT ? parseInt(process.env.TYPEORM_PORT, 10) : 5432,
    userName: process.env.TYPEORM_USERNAME || 'app_user',
    password: process.env.TYPEORM_PASSWORD || 'app_password',
    dbName: process.env.TYPEORM_DB_NAME || 'app-db',
    host: process.env.TYPEORM_HOST || 'db',
    synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
    logging: process.env.TYPEORM_LOGGING === 'true',
    entities: [process.env.TYPEORM_ENTITIES || 'src/api/repositories/entities/*.ts'],
    migrations: [process.env.TYPEORM_MIGRATIONS || 'src/db/migrations/*.ts'],
  },
  fromEmail: process.env.SEND_EMAIL || 'my_email',
  sendgridAPIKey: process.env.SENDGRID_API_KEY || 'my_api_key',
  JWTSecret: process.env.JWT_SECRET || 'very_secret_key',
  JWTExpiresIn: process.env.JWT_EXPIRE_IN || '1h',
  JWTExpiresInLong: process.env.JWT_EXPIRE_IN_LONG || '1h',
  githubClientId: process.env.GITHUB_CLIENT_ID || 'my_client_id',
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET || 'my_client_secret',
  wsPort: process.env.WS_PORT ? parseInt(process.env.WS_PORT) : 1990,
  userPhotosDir: '/users',
  nodeEnv: process.env.NODE_ENV || 'development',
  logOutput: process.env.LOG_OUTPUT || 'combined',
  photoResizeSizes: [
    { suffix: '_icon', width: 100, height: 100 },
    { suffix: '_normal', width: 300, height: 300 },
    { suffix: '_large', width: 500, height: 500 },
  ],
};

export default config;
