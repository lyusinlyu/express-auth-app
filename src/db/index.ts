import appDataSource from './appDataSource';

export class TypeORM {
  static async init() {
    try {
      await appDataSource.initialize();
      console.log('Connection initialized');
    } catch (error) {
      console.log(error);
      console.log('Error during db connection initialization:', error);
    }
  }
}
