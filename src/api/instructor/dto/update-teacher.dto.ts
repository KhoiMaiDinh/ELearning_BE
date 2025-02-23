import { PartialType } from '@nestjs/swagger';
import { RegisterAsInstructorReq } from './register-as-instructor.req.dto';

export class UpdateTeacherDto extends PartialType(RegisterAsInstructorReq) {}
