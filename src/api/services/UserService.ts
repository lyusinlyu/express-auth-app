/* eslint-disable no-useless-catch */
import { Service } from 'typedi';
import { UserRepository } from '../repositories/UserRepository';
import { User } from './models/User';
import { BaseService } from './BaseService';
import { PhotoService } from './PhotoService';
import Jimp from 'jimp';
import config from '../../config';
import path from 'path';

@Service()
export class UserService extends BaseService {
  constructor(private photoService: PhotoService) {
    super();
  }
  public getUser(userId: string): Promise<User | null> {
    return UserRepository.findById(userId);
  }

  public async uploadPhoto(user: User, file: Express.Multer.File): Promise<void> {
    try {
      return await this.transaction(async (unitOfWork) => {
        const savedPhoto = await this.photoService.savePhoto(file.filename, user, unitOfWork);
        if (!user.photos) {
          user.photos = [];
        }
        user.photos.push(savedPhoto);

        const sizes = config.photoResizeSizes;

        for (const size of sizes) {
          const fileNameWithoutExtension = path.basename(file.filename, path.extname(file.filename));
          const reSizedImageName = `${fileNameWithoutExtension}_${size.suffix}${path.extname(file.filename)}`;
          await this.resizeImage(file.path, reSizedImageName, size.width, size.height, size.suffix);
          const savedPhoto = await this.photoService.savePhoto(reSizedImageName, user, unitOfWork);
          user.photos.push(savedPhoto);
        }
        await unitOfWork.userRepository.save(user);
      });
    } catch (error) {
      throw error;
    }
  }

  private async resizeImage(
    filePath: string,
    fileName: string,
    width: number,
    height: number,
    suffix: string,
  ): Promise<string> {
    const image = await Jimp.read(filePath);
    image.resize(width, height);
    const directory = path.dirname(filePath);
    const outputPath = path.join(directory, fileName);
    await image.writeAsync(outputPath);
    return outputPath;
  }

  public getUserWithPhotos(userId: string): Promise<User | null> {
    return UserRepository.findByIdWithPhotos(userId);
  }
}
