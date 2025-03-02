import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import slugify from 'slugify';

@Injectable()
export class SlugParserPipe implements PipeTransform {
  transform(value: any) {
    if (typeof value !== 'string') {
      throw new BadRequestException('Slug must be a string');
    }

    // Split slugs if multiple (e.g., "slug1/slug2")
    const slugs = value.split('/').map((slug) => {
      const formatted_slug = slugify(slug, { lower: true, strict: true });

      if (!formatted_slug) {
        throw new BadRequestException(`Invalid slug format: "${slug}"`);
      }

      return formatted_slug;
    });

    return slugs.length === 1 ? slugs[0] : slugs;
  }
}
