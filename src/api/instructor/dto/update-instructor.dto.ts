import { UserBasicInfo } from '@/api/user/dto';
import { ClassField } from '@/decorators';
import { RegisterAsInstructorReq } from './register-as-instructor.req.dto';

export class UpdateInstructorReq extends RegisterAsInstructorReq {
  @ClassField(() => UserBasicInfo)
  user: UserBasicInfo;
}
