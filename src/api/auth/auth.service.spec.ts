// import { getQueueToken } from '@nestjs/bullmq';
// import { CACHE_MANAGER } from '@nestjs/cache-manager';
// import { ConfigService } from '@nestjs/config';
// import { JwtService } from '@nestjs/jwt';
// import { Test, TestingModule } from '@nestjs/testing';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { UserEntity } from '../user/entities/user.entity';
// import { AuthService } from './services/auth.service';
// import { OAuthService } from './services/oauth.service';

// describe('AuthService', () => {
//   let service: AuthService;
//   let configServiceValue: Partial<Record<keyof ConfigService, jest.Mock>>;
//   let oauthServiceValue: Partial<Record<keyof OAuthService, jest.Mock>>;
//   let jwtServiceValue: Partial<Record<keyof JwtService, jest.Mock>>;
//   let userRepositoryValue: Partial<
//     Record<keyof Repository<UserEntity>, jest.Mock>
//   >;

//   beforeAll(async () => {
//     configServiceValue = {
//       get: jest.fn(),
//     };

//     jwtServiceValue = {
//       sign: jest.fn(),
//       verify: jest.fn(),
//     };

//     userRepositoryValue = {
//       findOne: jest.fn(),
//     };

//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         AuthService,
//         {
//           provide: ConfigService,
//           useValue: configServiceValue,
//         },
//         {
//           provide: OAuthService,
//           useValue: oauthServiceValue,
//         },
//         {
//           provide: JwtService,
//           useValue: jwtServiceValue,
//         },
//         {
//           provide: getRepositoryToken(UserEntity),
//           useValue: userRepositoryValue,
//         },
//         {
//           provide: getQueueToken('email'),
//           useValue: {
//             add: jest.fn(),
//           },
//         },
//         {
//           provide: CACHE_MANAGER,
//           useValue: {
//             set: jest.fn(),
//           },
//         },
//       ],
//     }).compile();

//     service = module.get<AuthService>(AuthService);
//   });

//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });
// });
