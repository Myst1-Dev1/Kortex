import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  ping() {
    return {
      ok: true,
      service: 'auth',
      now: new Date().toISOString(),
    };
  }
}
