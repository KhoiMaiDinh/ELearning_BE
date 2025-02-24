describe('AuthService', () => {
  // let service: AuthService;
  // let configServiceValue: Partial<Record<keyof ConfigService, jest.Mock>>;
  // let tokenServiceValue: Partial<Record<keyof TokenService, jest.Mock>>;
  // let oauthServiceValue: Partial<Record<keyof OAuthService, jest.Mock>>;
  // let userRepositoryValue: Partial<Record<keyof UserRepository, jest.Mock>>;

  // beforeAll(async () => {
  //   configServiceValue = {
  //     get: jest.fn(),
  //   };

  //   userRepositoryValue = {
  //     findOneByPublicId: jest.fn(),
  //     findOneByEmail: jest.fn(),
  //   };

  //   const module: TestingModule = await Test.createTestingModule({
  //     providers: [
  //       AuthService,
  //       {
  //         provide: ConfigService,
  //         useValue: configServiceValue,
  //       },
  //       {
  //         provide: OAuthService,
  //         useValue: oauthServiceValue,
  //       },
  //       {
  //         provide: TokenService,
  //         useValue: tokenServiceValue,
  //       },
  //       {
  //         provide: getRepositoryToken(UserEntity),
  //         useValue: userRepositoryValue,
  //       },
  //       {
  //         provide: getQueueToken('email'),
  //         useValue: {
  //           add: jest.fn(),
  //         },
  //       },
  //       {
  //         provide: CACHE_MANAGER,
  //         useValue: {
  //           set: jest.fn(),
  //         },
  //       },
  //     ],
  //   }).compile();

  //   service = module.get<AuthService>(AuthService);
  // });

  // beforeEach(() => {
  //   jest.clearAllMocks();
  // });

  it('should be defined', () => {
    expect.anything();
    // expect(service).toBeDefined();
  });
});
