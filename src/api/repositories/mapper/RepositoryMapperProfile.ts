import { AutoMapper, ProfileBase, ignore, mapFrom } from '@nartc/automapper';
import { BaseEntity } from '../entities/BaseEntity';
import { AuthProvider } from '../../services/models/AuthProvicer';
import { BaseModel } from '../../services/models/BaseModel';
import { Photo } from '../../services/models/Photo';
import { User } from '../../services/models/User';
import { AuthProviderEntity } from '../entities/AuthProviderEntity';
import { PhotoEntity } from '../entities/PhotoEntity';
import { UserEntity } from '../entities/UserEntity';

export class RepositoryMapperProfile extends ProfileBase {
  constructor(mapper: AutoMapper) {
    super();
    mapper.createMap(UserEntity, User);
    mapper
      .createMap(User, UserEntity)
      .forMember((d) => d.id, ignore())
      .forMember((d) => d.createdAt, ignore())
      .forMember((d) => d.updatedAt, ignore());
    mapper.createMap(AuthProviderEntity, AuthProvider);
    mapper
      .createMap(AuthProvider, AuthProviderEntity)
      .forMember((d) => d.userId, ignore())
      .forMember((d) => d.createdAt, ignore())
      .forMember((d) => d.updatedAt, ignore());
    mapper.createMap(Photo, PhotoEntity, {
      includeBase: [BaseModel, BaseEntity],
    });
    mapper
      .createMap(PhotoEntity, Photo, {
        includeBase: [BaseEntity, BaseModel],
      })
      .forMember((d) => d.createdAt, ignore())
      .forMember((d) => d.updatedAt, ignore());
  }
}
