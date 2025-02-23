import { AllConfigType } from '@/config/config.type';
import { ErrorCode } from '@/constants/index';
import { UnauthorizedException } from '@/exceptions/index';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

type FacebookID = string;
type GoogleID = string;
interface InputTokenValidateResponse {
  data: {
    user_id: string;
    is_valid: boolean;
    error?: {
      subcode: number;
    };
  };
}

interface GetAccessTokenResponse {
  access_token: string;
}

@Injectable()
export class OAuthService {
  constructor(
    private readonly _configService: ConfigService<AllConfigType>,
    private readonly _httpService: HttpService,
  ) {}

  async verifyFacebookInputToken(input_token: string): Promise<FacebookID> {
    const url = 'https://graph.facebook.com/v20.0/debug_token';
    const access_token = await this.getFacebookAccessToken();

    const params = {
      input_token,
      access_token,
    };
    const facebook_response =
      await this._httpService.axiosRef.get<InputTokenValidateResponse>(url, {
        params,
      });
    if (facebook_response.data.data.is_valid == false) {
      let error_message: string = 'Invalid facebook token: ';
      let error_code: ErrorCode;
      switch (facebook_response.data.data.error.subcode) {
        case 463:
          error_message += 'Session has expired';
          error_code = ErrorCode.E055;
          break;
        case 460:
          error_message += 'The session is invalid because the user logged out';
          error_code = ErrorCode.E056;
          break;
        case 458:
          error_message += 'User has not authorized application';
          error_code = ErrorCode.E057;
          break;
        default:
          break;
      }
      throw new UnauthorizedException(error_code, error_message);
    }

    return facebook_response.data.data.user_id;
  }

  private async getFacebookAccessToken(): Promise<string> {
    const url = 'https://graph.facebook.com/oauth/access_token';

    const params = {
      client_id: this._configService.getOrThrow('auth.facebookAppID', {
        infer: true,
      }),
      client_secret: this._configService.getOrThrow(
        'auth.facebookClientSecret',
        { infer: true },
      ),
      grant_type: 'client_credentials',
    };

    const facebookResponse =
      await this._httpService.axiosRef.get<GetAccessTokenResponse>(url, {
        params,
      });
    return facebookResponse.data.access_token;
  }

  async verifyGoggleIDToken(id_token: string): Promise<GoogleID> {
    const client = new OAuth2Client();
    try {
      const ticket = await client.verifyIdToken({
        idToken: id_token,
        audience: this._configService.getOrThrow('auth.googleClientID', {
          infer: true,
        }),
      });
      return ticket.getAttributes().payload.sub;
    } catch (error) {
      if (error.message.startsWith('Wrong number of segments in token'))
        throw new UnauthorizedException(
          ErrorCode.E058,
          'Invalid google token: Token is not in the correct format',
        );
      if (
        error.message.startsWith(
          'Wrong recipient, payload audience != requiredAudience',
        )
      )
        throw new UnauthorizedException(
          ErrorCode.E060,
          'The token is not from current app',
        );
      throw new UnauthorizedException(
        ErrorCode.E059,
        'Invalid google token: Token is expired',
      );
    }
  }
}
