import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { RegistrationService } from './services/registration.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authServiceValue: Partial<Record<keyof AuthService, jest.Mock>>;
  let registrationServiceValue: Partial<
    Record<keyof RegistrationService, jest.Mock>
  >;

  beforeAll(async () => {
    authServiceValue = {
      emailLogIn: jest.fn(),
      logout: jest.fn(),
      refreshToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceValue,
        },
        {
          provide: RegistrationService,
          useValue: registrationServiceValue,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
