import { ArticleRes, CreateArticleReq } from '@/api/course-item';
import { ArticleService } from '@/api/course-item/article/article.service';
import { JwtPayloadType } from '@/api/token';
import { ApiAuth, CurrentUser } from '@/decorators';
import { Body, Controller, HttpStatus, Post } from '@nestjs/common';

@Controller({ path: 'articles', version: '1' })
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @ApiAuth({
    summary: 'create course item: Article',
    statusCode: HttpStatus.CREATED,
    type: ArticleRes,
  })
  @Post()
  async create(
    @CurrentUser() user: JwtPayloadType,
    @Body() dto: CreateArticleReq,
  ) {
    return await this.articleService.create(user, dto);
  }
}
