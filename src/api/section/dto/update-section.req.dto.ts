import { CreateSectionReq } from '@/api/section/dto/create-section.req.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateSectionReq extends OmitType(CreateSectionReq, ['course']) {}
