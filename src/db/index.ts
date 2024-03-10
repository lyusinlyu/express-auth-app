import logger from '../lib/logger';
import appDataSource from './appDataSource';

export class TypeORM {
  static async init() {
    try {
      await appDataSource.initialize();
      logger.info('Connection initialized');
    } catch (error) {
      logger.error(error);
      logger.error('Error during db connection initialization:', error);
    }
  }
}
