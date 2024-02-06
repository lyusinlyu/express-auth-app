import { Mapper } from '@nartc/automapper';
import { BadRequestError } from 'routing-controllers';
import appDataSource from '../../db/appDataSource';
import { User } from '../services/models/User';
import { UserEntity } from './entities/UserEntity';

export const UserRepository = appDataSource.getRepository(UserEntity).extend({
  async saveUser(user: User): Promise<User> {
    const userEntity = Mapper.map(user, UserEntity);
    const savedUser = await this.save(userEntity);
    return Mapper.map(savedUser, User);
  },

  async getUserByVerificationToken(verificationToken: string): Promise<User | undefined> {
    const userEntity = await this.findOneBy({ verificationToken });
    if (!userEntity) {
      throw new BadRequestError('User not found');
    }
    return Mapper.map(userEntity, User);
  },

  async findByEmail(email: string): Promise<User | undefined> {
    const userEntity = await this.findOneBy({ email });
    return userEntity ? Mapper.map(userEntity, User) : undefined;
  },

  async findByResetPasswordToken(resetPasswordToken: string): Promise<User | undefined> {
    const userEntity = await this.findOneBy({ resetPasswordToken });
    return userEntity ? Mapper.map(userEntity, User) : undefined;
  },
});
