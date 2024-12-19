import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ListResponseDto } from 'src/common/dto/list-response.dto';
import { UtilityResDto } from '../dto/utility.res.dto';

@Injectable()
export class UtilityService {
  private utility_service_url: string;
  private readonly logger = new Logger(UtilityService.name);
  constructor(private readonly _httpService: HttpService) {
    this.utility_service_url = process.env.UTILITY_SERVICE_URL;
  }

  async getFromMediaNumber(media_number: string): Promise<UtilityResDto> {
    try {
      const path = this.utility_service_url.concat('/api/v1/', 'medias');
      const response = await this._httpService.axiosRef.get<
        ListResponseDto<UtilityResDto>
      >(path, {
        params: {
          'media-numbers': [media_number],
        },
      });
      return response.data.results[0];
    } catch (error) {
      this.logger.log(error);
      throw error;
    }
  }
}
