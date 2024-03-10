import { Mapper } from '@nartc/automapper';
import {
  Authorized,
  JsonController,
  CurrentUser,
  Get,
  OnUndefined,
  Post,
  UseBefore,
  UploadedFile,
} from 'routing-controllers';
import { Service } from 'typedi';
import { User } from '../services/models/User';
import { UserResponse } from './responses/user/UserResponse';
import { UserService } from '../services/UserService';
import { EnsureUploadDirMiddleware } from '../middlewares/EnsureUploadDirMiddleware';
import { uploadMiddleware } from '../middlewares/uploadMiddleware';

@JsonController('/users')
@Service()
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/me')
  @Authorized(['admin', 'user'])
  public async getMe(@CurrentUser() user: User): Promise<UserResponse> {
    const userWithPhotos = await this.userService.getUserWithPhotos(user.id);
    return Mapper.map(userWithPhotos, UserResponse);
  }

  @OnUndefined(204)
  @Post('/photo')
  @Authorized()
  @UseBefore(EnsureUploadDirMiddleware)
  async uploadProfilePicture(
    @CurrentUser({ required: true }) user: User,
    @UploadedFile('file', { options: uploadMiddleware }) file: Express.Multer.File,
  ): Promise<void> {
    await this.userService.uploadPhoto(user, file);
  }
}
