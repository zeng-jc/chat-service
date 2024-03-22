import { Injectable } from '@nestjs/common';
import { SigninAuthDto } from './dto/signin-auth.dto';
// import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';
import { TokenPayload } from '../common/interface';
import { ErrorCode, ErrorMsg, HttpErrorException } from '../common/exceptionFilter';
import { DatabaseService } from '../database/database.service';
import { SecretKeyService } from '../secretKey/secretKey.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly database: DatabaseService,
    private readonly secretKey: SecretKeyService,
  ) {}

  // 判断邮箱是否存储在
  async emailExist(email: string, excludeId?: number): Promise<boolean> {
    let queryBuilder = this.database.usersRepo.createQueryBuilder('user');
    queryBuilder = queryBuilder.where('user.email = :email', { email });
    if (excludeId) {
      queryBuilder = queryBuilder.andWhere('user.id != :id', { id: excludeId });
    }
    return !!(await queryBuilder.getCount());
  }

  // 判断用户是否存储在
  async userExist(username: string, excludeId?: number): Promise<boolean> {
    let queryBuilder = this.database.usersRepo.createQueryBuilder('user');
    queryBuilder = queryBuilder.where('user.username = :username', { username });
    if (excludeId) {
      queryBuilder = queryBuilder.andWhere('user.id != :id', { id: excludeId });
    }
    return !!(await queryBuilder.getCount());
  }

  // 账号密码登录
  async signinAccount(signinAuthData: SigninAuthDto) {
    const { username, password } = signinAuthData;
    const userInfo = await this.database.usersRepo.findOne({
      where: {
        username,
        password,
      },
    });
    if (!userInfo) {
      throw new HttpErrorException(ErrorMsg.INVALID_IDENTITY_INFORMATION, ErrorCode.INVALID_IDENTITY_INFORMATION);
    }
    const TOKEN = this.createToken<TokenPayload>({
      id: userInfo.id,
      username: userInfo.username,
    });
    const data = {
      userInfo,
      token: TOKEN,
    };
    return data;
  }

  createToken<T>(payload: T): string {
    return jwt.sign(payload, this.secretKey.getPrivateKey(), {
      algorithm: 'RS256',
      expiresIn: 60 * 60 * 24,
    });
  }

  refreshToken(token: string) {
    const { id, username } = this.verifyToken(token);
    return this.createToken<TokenPayload>({
      id,
      username,
    });
  }

  verifyToken(token: string): TokenPayload {
    let result;
    try {
      result = jwt.verify(token, this.secretKey.getPublicKey(), {
        algorithms: ['RS256'],
      });
    } catch (error) {
      throw new HttpErrorException(ErrorMsg.TOKEN_INVALID, ErrorCode.TOKEN_INVALID);
    }
    return result;
  }
}
