import { AutoMapper, ProfileBase, mapWith } from '@nartc/automapper';
import { User } from '../../services/models/User';
import { UserResponse } from '../responses/user/UserResponse';
import { AuthResponse } from '../responses/auth/AuthResponse';
import { Auth } from '../../services/models/Auth';

export class ControllerMapperProfile extends ProfileBase {
  constructor(mapper: AutoMapper) {
    super();
    mapper.createMap(User, UserResponse).reverseMap();
    mapper.createMap(Auth, AuthResponse).reverseMap();
  }
}
