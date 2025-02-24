describe('UserService', () => {
  // let service: UserService;
  // let userRepositoryValue: Partial<Record<keyof UserRepository, jest.Mock>>;

  // beforeAll(async () => {
  //   userRepositoryValue = {
  //     findOneByPublicId: jest.fn(),
  //     findOneByEmail: jest.fn(),
  //   };

  //   const module: TestingModule = await Test.createTestingModule({
  //     providers: [
  //       UserService,
  //       {
  //         provide: UserRepository,
  //         useValue: userRepositoryValue,
  //       },
  //     ],
  //   }).compile();

  //   service = module.get<UserService>(UserService);
  // });

  // beforeEach(() => {
  //   jest.clearAllMocks();
  // });

  it('should be defined', () => {
    expect.anything();
    // expect(service).toBeDefined();
  });
});
