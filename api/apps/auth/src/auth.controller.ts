import { Body, Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern } from '@nestjs/microservices';
import { SignUpDto } from './dto/signUpDto';
import { SignInDto } from './dto/signInDto';
import { RefreshTokenDto } from './dto/refreshTokenDto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('service.ping')
  ping() {
    return this.authService.ping();
  }

  @MessagePattern('auth.signUp')
  signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  @MessagePattern('auth.signIn')
  signIn(@Body() dto: SignInDto) {
    return this.authService.signIn(dto);
  }

  @MessagePattern('auth.refreshToken')
  refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }
}
