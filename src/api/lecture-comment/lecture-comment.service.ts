import { JwtPayloadType } from '@/api/token';
import { Uuid } from '@/common';
import { ErrorCode, KafkaTopic } from '@/constants';
import { NotFoundException } from '@/exceptions';
import { KafkaProducerService } from '@/kafka';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LectureRepository } from '../course-item/lecture/lecture.repository';
import { CreateCommentReq, LectureCommentRes } from './dto';
import { CommentAspectEntity } from './entities/comment-aspect.entity';
import { LectureCommentEntity } from './entities/lecture-comment.entity';
import { Aspect, Emotion } from './enum';

@Injectable()
export class LectureCommentService {
  constructor(
    // private readonly courseAccessService: CourseAccessService,
    @InjectRepository(LectureCommentEntity)
    private readonly commentRepo: Repository<LectureCommentEntity>,
    private readonly lectureRepo: LectureRepository,
    private readonly producerService: KafkaProducerService,
  ) {}

  async create(user: JwtPayloadType, dto: CreateCommentReq) {
    const lecture = await this.lectureRepo.findOne({
      where: { id: dto.lecture_id },
      relations: ['section', 'section.course'],
    });

    if (!lecture) throw new NotFoundException(ErrorCode.E033); // Lecture not found

    // only allow if has finished the lesson
    // await this.courseAccessService.assertCanCommentOnLecture(
    //   user,
    //   lecture.section.course.id,
    // );

    const comment = this.commentRepo.create({
      content: dto.content,
      user: { id: user.id },
      lecture,
    });

    await this.commentRepo.save(comment);

    this.producerService.send(KafkaTopic.COMMENT_CREATED, comment);
    return comment.toDto(LectureCommentRes);
  }

  async saveAnalysis(
    lecture_comment_id: Uuid,
    analysis: { aspect: Aspect; emotion: Emotion }[],
  ) {
    const comment = await this.commentRepo.findOne({
      where: { lecture_comment_id },
      relations: ['aspects'],
    });

    if (!comment) throw new NotFoundException(ErrorCode.E073);

    const aspects = analysis.map((entry) => {
      const aspect = new CommentAspectEntity({
        aspect: entry.aspect,
        emotion: entry.emotion,
      });
      return aspect;
    });

    comment.aspects = aspects;

    await this.commentRepo.save(comment);

    return comment;
  }
}
