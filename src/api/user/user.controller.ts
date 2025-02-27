import { CursorPaginatedDto, Nanoid, OffsetPaginatedDto } from '@/common';
import { Permission } from '@/constants';
import { ApiAuth, CurrentUser, Permissions } from '@/decorators';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ParseNanoidPipe } from '../../pipes';
import {
  ChangePasswordReq,
  CreateUserReqDto,
  ListUserReqDto,
  LoadMoreUsersReqDto,
  UpdateUserReqDto,
  UserRes,
} from './dto';
import { UserService } from './user.service';

@ApiTags('users')
@Controller({
  path: 'users',
  version: '1',
})
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiAuth({
    type: UserRes,
    summary: 'Get current user',
  })
  @Get('me')
  async getCurrentUser(@CurrentUser('id') user_id: Nanoid): Promise<UserRes> {
    return await this.userService.findOne(user_id);
  }

  @Post()
  @ApiAuth({
    type: UserRes,
    summary: 'Create user',
    statusCode: HttpStatus.CREATED,
  })
  @Permissions(Permission.CREATE_USER)
  async createUser(@Body() createUserDto: CreateUserReqDto): Promise<UserRes> {
    return await this.userService.create(createUserDto);
  }

  @Get()
  @ApiAuth({
    type: UserRes,
    summary: 'List users',
    isPaginated: true,
  })
  async findAllUsers(
    @Query() reqDto: ListUserReqDto,
  ): Promise<OffsetPaginatedDto<UserRes>> {
    return await this.userService.findAll(reqDto);
  }

  @Get('/load-more')
  @ApiAuth({
    type: UserRes,
    summary: 'Load more users',
    isPaginated: true,
    paginationType: 'cursor',
  })
  async loadMoreUsers(
    @Query() reqDto: LoadMoreUsersReqDto,
  ): Promise<CursorPaginatedDto<UserRes>> {
    return await this.userService.loadMoreUsers(reqDto);
  }

  @Get(':id')
  @ApiAuth({ type: UserRes, summary: 'Find user by id' })
  @ApiParam({ name: 'id', type: 'String' })
  async findUser(@Param('id', ParseNanoidPipe) id: Nanoid): Promise<UserRes> {
    return await this.userService.findOne(id);
  }

  @Patch(':id')
  @Permissions(Permission.WRITE_USER)
  @ApiAuth({ type: UserRes, summary: 'Update user', statusCode: HttpStatus.OK })
  @ApiParam({ name: 'id', type: 'String' })
  updateUser(
    @Param('id', ParseNanoidPipe) id: Nanoid,
    @Body() reqDto: UpdateUserReqDto,
  ) {
    return this.userService.update(id, reqDto);
  }

  @Put('me')
  @ApiAuth({
    type: UserRes,
    summary: 'Update current user',
    statusCode: HttpStatus.OK,
  })
  async updateCurrentUser(
    @CurrentUser('id') id: Nanoid,
    @Body() reqDto: UpdateUserReqDto,
  ) {
    return await this.userService.update(id, reqDto);
  }

  @Delete(':id')
  @ApiAuth({
    summary: 'Delete user',
  })
  @ApiParam({ name: 'id', type: 'String' })
  removeUser(@Param('id', ParseNanoidPipe) id: Nanoid) {
    return this.userService.remove(id);
  }

  @ApiAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('me/change-password')
  async changePassword(
    @CurrentUser('id') user_id: Nanoid,
    @Body() reqDto: ChangePasswordReq,
  ) {
    return await this.userService.changePassword(user_id, reqDto);
  }
}
