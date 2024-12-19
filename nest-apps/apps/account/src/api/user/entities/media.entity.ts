import { MediaTypeEnum } from '../enums/media-type.enum';

export class Media {
  media_number!: string;
  media_url!: string;
  media_url_lg?: string | null;
  media_url_md?: string | null;
  media_url_sm?: string | null;
  media_type!: MediaTypeEnum;
}
