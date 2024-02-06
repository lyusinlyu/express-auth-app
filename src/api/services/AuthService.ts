import { Service } from 'typedi';
import { RegisterBody } from '../controllers/requests/auth/RegisterBody';
import { User } from './models/User';
import * as argon from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { UserRepository } from '../repositories/UserRepository';
import { MailService } from './MailService';
import { UserStatus } from '../enums/UserStatuses';
import { LoginBody } from '../controllers/requests/auth/LoginBody';
import config from '../../config';
import jwt from 'jsonwebtoken';
import { Auth } from './models/Auth';
@Service()
export class AuthService {
  constructor(private mailService: MailService) {}
  public async register(userData: RegisterBody): Promise<User> {
    try {
      const passwordHash = await argon.hash(userData.password);
      const verificationToken = this.generateVerificationToken();
      const resetPasswordToken = this.generateVerificationToken();
      const user = new User();
      user.firstName = userData.firstName;
      user.lastName = userData.lastName;
      user.email = userData.email;
      user.passwordHash = passwordHash;
      user.role = 'user';
      user.status = 'new';
      user.verificationToken = verificationToken;
      user.resetPasswordToken = resetPasswordToken;
      user.isEmailSent = false;
      const savedUser = await UserRepository.saveUser(user);
      const emailSent = await this.mailService.sendMail(
        user.email,
        verificationToken,
        'Email Verification',
        savedUser.id,
      );
      if (emailSent) {
        savedUser.isEmailSent = true;
        await UserRepository.saveUser(savedUser);
      }

      return savedUser;
    } catch (error: any) {
      if (error.code === '23505') {
        throw new Error('User exist');
      }
      throw error;
    }
  }

  public async login(loginData: LoginBody): Promise<Auth> {
    const user = await UserRepository.findByEmail(loginData.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    if (user.status !== UserStatus.ACTIVE) {
      throw new Error('User not active');
    }
    const isPasswordValid = await argon.verify(user.passwordHash, loginData.password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }
    return await this.signToken(user.id, loginData.rememberMe);
  }

  async signToken(userId: string, rememberMe: boolean): Promise<Auth> {
    const payload = { id: userId };
    const secret = config.JWTSecret;
    const expiresIn = config.JWTExpiresIn;
    const expressInLong = config.JWTExpiresInLong;
    const token = jwt.sign(payload, secret, {
      expiresIn: rememberMe ? expressInLong : expiresIn,
    });
    const result = new Auth();
    result.token = token;
    return result;
  }

  async resetPassword(email: string): Promise<void> {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    const emailSent = await this.mailService.sendMail(email, user.resetPasswordToken, 'Reset Password', user.id);
    if (!emailSent) {
      throw new Error('Error sending email');
    }
  }

  async newPassword(token: string, password: string): Promise<void> {
    const user = await UserRepository.findByResetPasswordToken(token);
    if (!user) {
      throw new Error('Invalid token');
    }
    user.passwordHash = await argon.hash(password);
    user.resetPasswordToken = this.generateVerificationToken();
    await UserRepository.save(user);
  }

  public generateVerificationToken(): string {
    return uuidv4();
  }

  public async confirmEmail(verificationToken: string): Promise<void> {
    const user = await UserRepository.getUserByVerificationToken(verificationToken);
    if (user) {
      user.status = UserStatus.ACTIVE;
      await UserRepository.save(user);
    }
  }
}
