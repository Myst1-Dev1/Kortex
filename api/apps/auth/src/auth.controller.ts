import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RefreshTokenResponse, SignInResponse, SignUpResponse } from './interfaces/auth-interfaces';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('service.ping')
  ping() {
    return this.authService.ping();
  }

  @MessagePattern('auth.signUp')
  signUp(@Payload() dto: SignUpResponse) {
    return this.authService.signUp(dto);
  }

  @MessagePattern('auth.signIn')
  signIn(@Payload() dto: SignInResponse) {
    return this.authService.signIn(dto);
  }

  @MessagePattern('auth.refreshToken')
  refreshToken(@Payload() dto: RefreshTokenResponse) {
    return this.authService.refreshToken(dto);
  }

  @MessagePattern('auth.findUsersByIds')
  findUsersByIds(@Payload() data: { ids: string[] }) {
    return this.authService.findUsersByIds(data.ids);
  }
}
