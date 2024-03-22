import { Body, Controller, Headers, Param, Post } from '@nestjs/common';
import { SigninAuthDto } from './dto/signin-auth.dto';
import { AuthService } from './auth.service';
import { HeadersAuthDto } from './dto/headers-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  // 账号密码登录
  @Post('signin')
  signinAccount(@Body() signinAuthData: SigninAuthDto) {
    return this.authService.signinAccount(signinAuthData);
  }

  // 判断用户是否存在
  @Post('user-is-exist/:user')
  userIsExist(@Param('user') user: string) {
    return this.authService.userExist(user);
  }

  // token刷新
  @Post('refresh-token')
  refreshToken(@Headers() headers: HeadersAuthDto) {
    const token = headers.authorization?.split(' ')[1];
    return this.authService.refreshToken(token);
  }

  @Post('verify-token')
  verifyToken(@Headers() headers: HeadersAuthDto) {
    const token = headers.authorization?.split(' ')[1];
    return this.authService.verifyToken(token);
  }
}
