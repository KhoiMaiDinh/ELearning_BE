import { SuccessBasicDto } from '@/common/dto/success-basic.dto';
import { CookiesEnum } from '@/constants/index';
import { ApiAuth, ApiPublic, Cookies, CurrentUser } from '@/decorators/index';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtPayloadType } from '../token/types/jwt-payload.type';
import {
  EmailLoginReq,
  EmailRegisterReq,
  FacebookLoginReq,
  FacebookRegisterReq,
  ForgotPasswordReq,
  GoogleLoginReq,
  GoogleRegisterReq,
  LoginRes,
  RefreshRes,
  RegisterRes,
  ResetPasswordReq,
  VerifyEmailReq,
} from './dto';
import { AuthService } from './services/auth.service';
import { RegistrationService } from './services/registration.service';

@ApiTags('auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly registrationService: RegistrationService,
  ) {}

  @ApiPublic({
    type: LoginRes,
    summary: 'Log in with email',
  })
  @Post('email/login')
  async emailLogIn(
    @Body() userLogin: EmailLoginReq,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginRes> {
    const result = await this.authService.emailLogIn(userLogin);
    response.cookie(CookiesEnum.ACCESS_TOKEN, `Bearer ${result.access_token}`);
    response.cookie(CookiesEnum.REFRESH_TOKEN, result.refresh_token, {
      httpOnly: true,
      secure: true,
    });
    return result;
  }

  @ApiPublic({
    type: LoginRes,
    summary: 'Log in with Facebook',
  })
  @Post('facebook/login')
  async facebookLogIn(
    @Body() userLogin: FacebookLoginReq,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginRes> {
    const result = await this.authService.facebookLogIn(userLogin);
    response.cookie(CookiesEnum.ACCESS_TOKEN, `Bearer ${result.access_token}`);
    response.cookie(CookiesEnum.REFRESH_TOKEN, result.refresh_token, {
      httpOnly: true,
      secure: true,
    });
    return result;
  }

  @ApiPublic({
    type: LoginRes,
    summary: 'Log in with Google',
  })
  @Post('google/login')
  async googleLogIn(
    @Body() userLogin: GoogleLoginReq,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginRes> {
    const result = await this.authService.googleLogIn(userLogin);
    response.cookie(CookiesEnum.ACCESS_TOKEN, `Bearer ${result.access_token}`);
    response.cookie(CookiesEnum.REFRESH_TOKEN, result.refresh_token, {
      httpOnly: true,
      secure: true,
    });
    return result;
  }

  @ApiPublic({ statusCode: HttpStatus.CREATED })
  @Post('email/register')
  async register(@Body() dto: EmailRegisterReq): Promise<SuccessBasicDto> {
    await this.registrationService.emailRegister(dto);

    return {
      message: 'Register successfully',
      status_code: HttpStatus.CREATED,
    };
  }

  @ApiPublic()
  @Post('facebook/register')
  async facebookRegister(
    @Body() dto: FacebookRegisterReq,
  ): Promise<RegisterRes> {
    return await this.registrationService.facebookRegister(dto);
  }

  @ApiPublic()
  @Post('google/register')
  async googleRegister(@Body() dto: GoogleRegisterReq): Promise<RegisterRes> {
    return await this.registrationService.googleRegister(dto);
  }

  @ApiAuth({
    summary: 'Logout',
  })
  @Post('logout')
  async logout(@CurrentUser() userToken: JwtPayloadType): Promise<void> {
    await this.authService.logout(userToken);
  }

  @ApiPublic({
    type: RefreshRes,
    summary: 'Refresh token',
  })
  @Post('refresh')
  @HttpCode(204)
  async refresh(
    @Cookies(CookiesEnum.REFRESH_TOKEN) refreshToken: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<RefreshRes> {
    const tokens = await this.authService.refreshToken({ refreshToken });
    response.cookie(CookiesEnum.ACCESS_TOKEN, tokens.access_token);
    response.cookie(CookiesEnum.REFRESH_TOKEN, tokens.refresh_token, {
      httpOnly: true,
      secure: true,
    });
    return;
  }

  @ApiPublic()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() dto: ForgotPasswordReq,
  ): Promise<SuccessBasicDto> {
    await this.authService.forgotPassword(dto);

    return {
      message: 'Request reset password successfully',
      status_code: HttpStatus.OK,
    };
  }

  @ApiPublic()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordReq): Promise<SuccessBasicDto> {
    await this.authService.resetPassword(dto);

    return {
      message: 'Reset password successfully',
      status_code: HttpStatus.OK,
    };
  }

  @ApiPublic()
  @Post('verify/email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyEmailReq): Promise<SuccessBasicDto> {
    await this.registrationService.verifyEmail(dto);

    return {
      message: 'Reset password successfully',
      status_code: HttpStatus.OK,
    };
  }

  @ApiAuth()
  @Post('verify/email/resend')
  @HttpCode(HttpStatus.OK)
  async resendVerifyEmail(
    @CurrentUser() userToken: JwtPayloadType,
  ): Promise<SuccessBasicDto> {
    await this.registrationService.resendVerifyEmail(userToken);
    return {
      message: 'Request email verification successfully',
      status_code: HttpStatus.OK,
    };
  }
}
