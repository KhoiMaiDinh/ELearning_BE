import {
  CategoryRes,
  CreateCategoryReq,
  GetCategoriesQuery,
  GetCategoryQuery,
  UpdateCategoryReq,
} from '@/api/category';
import { PERMISSION } from '@/constants';
import { ApiAuth, ApiPublic, Permissions, Public } from '@/decorators';
import { SlugParserPipe } from '@/pipes/slug-parse.pipe';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { InstructorRes } from '../instructor';
import { CategoryService } from './category.service';

@Controller({ path: 'categories', version: '1' })
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiAuth({ type: CategoryRes, statusCode: HttpStatus.CREATED })
  @Permissions(PERMISSION.WRITE_CATEGORY)
  async create(@Body() dto: CreateCategoryReq): Promise<CategoryRes> {
    return await this.categoryService.create(dto);
  }

  @Get()
  @Public()
  @ApiPublic({ type: CategoryRes, statusCode: HttpStatus.OK })
  findAll(@Query() query: GetCategoriesQuery): Promise<CategoryRes[]> {
    return this.categoryService.findAll(query);
  }

  @Get(':slug/instructors')
  @ApiAuth({ type: InstructorRes, statusCode: HttpStatus.OK })
  findOneInstructors(
    @Param('slug', SlugParserPipe) slug: string,
  ): Promise<InstructorRes[]> {
    return this.categoryService.findOneInstructors(slug);
  }

  @Get(':slug')
  @ApiAuth({ type: CategoryRes, statusCode: HttpStatus.OK })
  async findOne(
    @Param('slug', SlugParserPipe) slug: string,
    @Query() query: GetCategoryQuery,
  ): Promise<CategoryRes> {
    return await this.categoryService.findOne(slug, query);
  }

  @Put(':slug')
  @ApiAuth({ type: CategoryRes, statusCode: HttpStatus.OK })
  @Permissions(PERMISSION.WRITE_CATEGORY)
  update(
    @Param('slug', SlugParserPipe) slug: string,
    @Body() updateCategoryDto: UpdateCategoryReq,
  ) {
    return this.categoryService.update(slug, updateCategoryDto);
  }

  @Delete(':slug')
  @ApiAuth({ type: CategoryRes, statusCode: HttpStatus.NO_CONTENT })
  @Permissions(PERMISSION.DELETE_CATEGORY)
  async remove(@Param('slug') slug: string) {
    return await this.categoryService.remove(slug);
  }
}
