import { Nanoid } from '@/common/index';
import { Injectable } from '@nestjs/common';
import { UserRepository } from '../user/entities/user.repository';
import { InstructorRes } from './dto/instructor.res.dto';
import { RegisterAsInstructorReq } from './dto/register-as-instructor.req.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Injectable()
export class InstructorService {
  constructor(private readonly userRepository: UserRepository) {}
  async create(
    user_public_id: Nanoid,
    dto: RegisterAsInstructorReq,
  ): Promise<InstructorRes> {
    const user = await this.userRepository.findOneBy({
      id: user_public_id,
    });
    return;
    // return this.userRepository.save({
    //   public_id: user_public_id,
    //   is_instructor: true,
    // });
  }

  findAll() {
    return `This action returns all teacher`;
  }

  findOne(id: number) {
    return `This action returns a #${id} teacher`;
  }

  update(id: number, updateTeacherDto: UpdateTeacherDto) {
    return `This action updates a #${id} teacher`;
  }

  remove(id: number) {
    return `This action removes a #${id} teacher`;
  }
}
