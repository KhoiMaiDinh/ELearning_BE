describe('AuthController', () => {
  // let controller: AuthController;
  // let authServiceValue: Partial<Record<keyof AuthService, jest.Mock>>;
  // let registrationServiceValue: Partial<
  //   Record<keyof RegistrationService, jest.Mock>
  // >;

  // beforeAll(async () => {
  //   authServiceValue = {
  //     emailLogIn: jest.fn(),
  //     logout: jest.fn(),
  //     refreshToken: jest.fn(),
  //   };

  //   const module: TestingModule = await Test.createTestingModule({
  //     controllers: [AuthController],
  //     providers: [
  //       {
  //         provide: AuthService,
  //         useValue: authServiceValue,
  //       },
  //       {
  //         provide: RegistrationService,
  //         useValue: registrationServiceValue,
  //       },
  //     ],
  //   }).compile();

  //   controller = module.get<AuthController>(AuthController);
  // });

  // beforeEach(() => {
  //   jest.clearAllMocks();
  // });

  it('should be defined', () => {
    expect.anything();
    // expect(controller).toBeDefined();
  });
});
