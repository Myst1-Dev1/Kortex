import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            ping: jest.fn().mockReturnValue({ ok: true, service: 'auth', now: '2026-01-01T00:00:00.000Z' }),
            signUp: jest.fn().mockResolvedValue({ user: {}, accessToken: 'at', refreshToken: 'rt' }),
            signIn: jest.fn().mockResolvedValue({ user: {}, accessToken: 'at', refreshToken: 'rt' }),
            refreshToken: jest.fn().mockResolvedValue({ accessToken: 'at', refreshToken: 'rt' }),
            validateToken: jest.fn().mockResolvedValue(true),
            revokeSession: jest.fn().mockResolvedValue(undefined),
            findUsersByIds: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    authController = app.get<AuthController>(AuthController);
    authService = app.get<AuthService>(AuthService);
  });

  describe('ping', () => {
    it('should return auth health payload', () => {
      expect(authController.ping()).toEqual({
        ok: true,
        service: 'auth',
        now: '2026-01-01T00:00:00.000Z',
      });
      expect(authService.ping).toHaveBeenCalled();
    });
  });

  describe('signUp', () => {
    it('should create a new user', async () => {
      const dto = { name: 'Test', email: 'test@example.com', password: 'pass', avatarUrl: null };
      const result = await authController.signUp(dto);
      expect(result.user).toBeDefined();
      expect(authService.signUp).toHaveBeenCalledWith(dto);
    });
  });

  describe('signIn', () => {
    it('should sign in a user', async () => {
      const dto = { email: 'test@example.com', password: 'pass' };
      const result = await authController.signIn(dto);
      expect(result.accessToken).toBeDefined();
      expect(authService.signIn).toHaveBeenCalledWith(dto);
    });
  });

  describe('validateToken', () => {
    it('should validate a token', async () => {
      const result = await authController.validateToken({ userId: 'user-1' });
      expect(result).toBe(true);
      expect(authService.validateToken).toHaveBeenCalledWith('user-1');
    });
  });

  describe('logout', () => {
    it('should revoke session', async () => {
      const result = await authController.logout({ userId: 'user-1' });
      expect(authService.revokeSession).toHaveBeenCalledWith('user-1');
    });
  });
});
