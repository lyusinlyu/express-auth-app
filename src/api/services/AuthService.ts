import Container, { Service } from 'typedi';
import { RegisterBody } from '../controllers/requests/auth/RegisterBody';
import { User } from './models/User';
import * as argon from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { UserRepository } from '../repositories/UserRepository';
import { MailService } from './MailService';
import { UserStatus } from '../enums/UserStatus';
import { LoginBody } from '../controllers/requests/auth/LoginBody';
import config from '../../config';
import jwt from 'jsonwebtoken';
import { Auth } from './models/Auth';
import { AuthProvider } from './models/AuthProvicer';
import { AuthProviderRepository } from '../repositories/AuthProvicerRepository';
import { BaseService } from './BaseService';
import { UserService } from './UserService';
import { BadRequestError } from 'routing-controllers';
import { WebSocketService } from '../../websocket';
interface JWTPayload {
  id: string;
}
@Service()
export class AuthService extends BaseService {
  constructor(
    private mailService: MailService,
    private userService: UserService,
  ) {
    super();
  }
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
        console.log(3333, savedUser);
        savedUser.isEmailSent = true;
        await UserRepository.saveUser(savedUser);
      }

      return savedUser;
    } catch (error: any) {
      console.log(11, error.message);
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

  public async logout(userId: string): Promise<void> {
    const webSocketService = Container.get(WebSocketService);
    webSocketService.notifyLogout(userId);
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

  public async checkToken(token: string, roles?: string[]): Promise<string> {
    try {
      const payload = jwt.verify(token, config.JWTSecret) as JWTPayload;
      const user = await this.userService.getUser(payload.id);
      if (!user) {
        throw new BadRequestError('Invalid credentials');
      }

      if (roles && !roles.includes(user.role)) {
        throw new BadRequestError('Access denied');
      }

      return user.id;
    } catch (e) {
      console.error(e);
      throw new BadRequestError('Unexpected error');
    }
  }

  public async findOrCreateUserWithProvider(userData: User, authProviderData: AuthProvider): Promise<User> {
    try {
      let user = await UserRepository.findByEmail(userData.email);
      if (!user) {
        userData.role = 'user';
        userData.status = UserStatus.ACTIVE;
        user = await UserRepository.saveUser(userData);
      }
      const existingAuthProvider = await AuthProviderRepository.findByProviderId(authProviderData.providerId);

      if (!existingAuthProvider) {
        authProviderData.userId = user.id;
        await AuthProviderRepository.save(authProviderData);
      } else {
        await AuthProviderRepository.update(
          { id: existingAuthProvider.id },
          { providerId: authProviderData.providerId },
        );
      }

      return user;
    } catch (error: any) {
      console.error('Error in findOrCreateUser:', error);
      throw new Error('Error creating or finding user');
    }
  }

  async socialLogin(id: string): Promise<Auth> {
    const rememberMe = false; // Set the value of rememberMe as per your requirement
    return await this.signToken(id, rememberMe);
  }
}
