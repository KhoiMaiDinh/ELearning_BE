import { TokenService } from '@/api/token/token.service';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let reflector: Partial<Record<keyof Reflector, jest.Mock>>;
  let tokenService: Partial<Record<keyof TokenService, jest.Mock>>;
  let context: Partial<Record<keyof ExecutionContext, jest.Mock>>;
  let module: TestingModule;

  beforeAll(async () => {
    tokenService = {
      verifyAccessToken: jest.fn(),
    };

    reflector = {
      getAllAndOverride: jest.fn(),
    };

    context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn(),
      }),
    };

    module = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: TokenService,
          useValue: tokenService,
        },
        {
          provide: Reflector,
          useValue: reflector,
        },
      ],
    }).compile();
    guard = module.get<AuthGuard>(AuthGuard);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    module.close();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if the route is public', async () => {
      const isPublic = true;
      reflector.getAllAndOverride.mockReturnValue(isPublic);

      const result = await guard.canActivate(context as ExecutionContext);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
        context.getHandler(),
        context.getClass(),
      ]);
      expect(reflector.getAllAndOverride).toHaveBeenCalledTimes(1);
      expect(context.switchToHttp().getRequest).not.toHaveBeenCalled();
      expect(tokenService.verifyAccessToken).not.toHaveBeenCalled();
    });

    it('should return true if the route is auth optional and no token is provided', async () => {
      const isPublic = false;
      reflector.getAllAndOverride.mockReturnValueOnce(isPublic);

      const isAuthOptional = true;
      reflector.getAllAndOverride.mockReturnValueOnce(isAuthOptional);

      context.switchToHttp().getRequest.mockReturnValue({
        headers: {},
      });

      const result = await guard.canActivate(context as ExecutionContext);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
        context.getHandler(),
        context.getClass(),
      ]);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
        'isAuthOptional',
        [context.getHandler(), context.getClass()],
      );
      expect(reflector.getAllAndOverride).toHaveBeenCalledTimes(2);
      expect(context.switchToHttp().getRequest).toHaveBeenCalledTimes(1);
      expect(tokenService.verifyAccessToken).not.toHaveBeenCalled();
    });

    it('should verify the token and return true if the route is auth optional and the token is valid', async () => {
      const isPublic = false;
      reflector.getAllAndOverride.mockReturnValueOnce(isPublic);

      const isAuthOptional = true;
      reflector.getAllAndOverride.mockReturnValueOnce(isAuthOptional);

      context.switchToHttp().getRequest.mockReturnValue({
        headers: {
          authorization: 'Bearer accessToken',
        },
      });

      tokenService.verifyAccessToken.mockReturnValueOnce({ id: 'x' });

      const result = await guard.canActivate(context as ExecutionContext);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
        context.getHandler(),
        context.getClass(),
      ]);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
        'isAuthOptional',
        [context.getHandler(), context.getClass()],
      );
      expect(reflector.getAllAndOverride).toHaveBeenCalledTimes(2);
      expect(context.switchToHttp().getRequest).toHaveBeenCalledTimes(1);
      expect(tokenService.verifyAccessToken).toHaveBeenCalledTimes(1);
    });

    it('should throw an UnauthorizedException if the route is not public and no token is provided', async () => {
      const isPublic = false;
      reflector.getAllAndOverride.mockReturnValueOnce(isPublic);

      const isAuthOptional = false;
      reflector.getAllAndOverride.mockReturnValueOnce(isAuthOptional);

      context.switchToHttp().getRequest.mockReturnValue({
        headers: {},
      });

      await expect(
        guard.canActivate(context as ExecutionContext),
      ).rejects.toThrow(UnauthorizedException);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
        context.getHandler(),
        context.getClass(),
      ]);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
        'isAuthOptional',
        [context.getHandler(), context.getClass()],
      );
      expect(reflector.getAllAndOverride).toHaveBeenCalledTimes(2);
      expect(context.switchToHttp().getRequest).toHaveBeenCalledTimes(1);
      expect(tokenService.verifyAccessToken).not.toHaveBeenCalled();
    });

    it('should throw an UnauthorizedException if the token is invalid', async () => {
      const isPublic = false;
      reflector.getAllAndOverride.mockReturnValueOnce(isPublic);

      const isAuthOptional = false;
      reflector.getAllAndOverride.mockReturnValueOnce(isAuthOptional);

      context.switchToHttp().getRequest.mockReturnValue({
        headers: {
          authorization: 'Bearer accessToken',
        },
      });

      tokenService.verifyAccessToken.mockImplementationOnce(() => {
        throw new UnauthorizedException();
      });

      await expect(
        guard.canActivate(context as ExecutionContext),
      ).rejects.toThrow(UnauthorizedException);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
        context.getHandler(),
        context.getClass(),
      ]);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
        'isAuthOptional',
        [context.getHandler(), context.getClass()],
      );
      expect(reflector.getAllAndOverride).toHaveBeenCalledTimes(2);
      expect(context.switchToHttp().getRequest).toHaveBeenCalledTimes(1);
      expect(tokenService.verifyAccessToken).toHaveBeenCalledTimes(1);
    });

    it('should verify the token and return true if the route is not public and the token is valid', async () => {
      const isPublic = false;
      reflector.getAllAndOverride.mockReturnValueOnce(isPublic);

      const isAuthOptional = false;
      reflector.getAllAndOverride.mockReturnValueOnce(isAuthOptional);

      context.switchToHttp().getRequest.mockReturnValue({
        headers: {
          authorization: 'Bearer accessToken',
        },
      });

      tokenService.verifyAccessToken.mockReturnValueOnce({ id: 'x' });

      const result = await guard.canActivate(context as ExecutionContext);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
        context.getHandler(),
        context.getClass(),
      ]);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
        'isAuthOptional',
        [context.getHandler(), context.getClass()],
      );
      expect(reflector.getAllAndOverride).toHaveBeenCalledTimes(2);
      expect(context.switchToHttp().getRequest).toHaveBeenCalledTimes(1);
      expect(tokenService.verifyAccessToken).toHaveBeenCalledTimes(1);
    });
  });
});
