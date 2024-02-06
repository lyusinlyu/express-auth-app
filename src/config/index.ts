import { config as dotenvConfig } from 'dotenv';

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
};

export default config;
