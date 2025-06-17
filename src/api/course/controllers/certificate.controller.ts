import { JwtPayloadType } from '@/api/token';
import { ApiAuth, CurrentUser } from '@/decorators';
import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CertificateResDto } from '../dto/certificate.res.dto';
import { CertificateService } from '../services/certificate.service';

@Controller({ path: 'certificates', version: '1' })
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Get('me')
  @ApiAuth({
    summary: 'Get all earned certificates by the current user',
    statusCode: HttpStatus.OK,
  })
  async getMyCertificates(@CurrentUser() user: JwtPayloadType) {
    const certificates = await this.certificateService.getAllUserCertificates(
      user.id,
    );
    return plainToInstance(CertificateResDto, certificates);
  }

  @Get(':id')
  @ApiAuth({
    summary: 'Get a certificate by its certificate code',
    statusCode: HttpStatus.OK,
  })
  async getCertificateByCode(@Param('id') code: string) {
    const certificate =
      await this.certificateService.getByCertificateCode(code);
    return certificate.toDto(CertificateResDto);
  }
}
