import { JwtPayloadType } from '@/api/token';
import { Nanoid, Uuid } from '@/common';
import { ErrorCode, KafkaTopic } from '@/constants';
import { NotFoundException } from '@/exceptions';
import { KafkaProducerService } from '@/kafka';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { LectureRepository } from '../course-item/lecture/lecture.repository';
import { UserRepository } from '../user/user.repository';
import { CreateCommentReq, LectureCommentRes } from './dto';
import { FindLectureCommentsRes } from './dto/aspect-statistic.res.dto';
import { LectureCommentsQuery } from './dto/lecture-comment.query.dto';
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
    private readonly userRepository: UserRepository,
  ) {}

  async create(user_payload: JwtPayloadType, dto: CreateCommentReq) {
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

    const user = await this.userRepository.findOneByPublicId(user_payload.id);

    const comment = this.commentRepo.create({
      content: dto.content,
      user,
      lecture,
    });

    await this.commentRepo.save(comment);

    this.producerService.send(
      KafkaTopic.COMMENT_CREATED,
      JSON.stringify(comment),
    );
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
      if (entry.emotion != Emotion.NONE) {
        const aspect = new CommentAspectEntity({
          aspect: entry.aspect,
          emotion: entry.emotion,
        });
        return aspect;
      }
    });

    comment.aspects = aspects;

    await this.commentRepo.save(comment);

    return comment;
  }

  async findWithAspectStats(lecture_id: Nanoid, filter: LectureCommentsQuery) {
    const query = this.commentRepo
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.aspects', 'aspect')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('user.profile_image', 'profile_image')
      .leftJoinAndSelect('comment.lecture', 'lecture');

    query.where('lecture.id = :lecture_id', { lecture_id: lecture_id });

    if (filter.aspect) {
      query.andWhere('aspect.aspect = :aspect', { aspect: filter.aspect });
    }

    if (filter.emotion) {
      query.andWhere('aspect.emotion = :emotion', { emotion: filter.emotion });
    }

    if (filter.is_solved !== undefined) {
      query.andWhere('comment.is_solved = :is_solved', {
        is_solved: filter.is_solved,
      });
    }

    const comments = await query.getMany();

    const stats: Record<string, Record<Emotion, number>> = {};

    for (const comment of comments) {
      for (const aspect of comment.aspects) {
        if (!stats[aspect.aspect]) {
          stats[aspect.aspect] = {
            positive: 0,
            neutral: 0,
            negative: 0,
            none: 0,
          };
        }
        stats[aspect.aspect][aspect.emotion]++;
      }
    }

    return plainToInstance(FindLectureCommentsRes, {
      comments: comments.map((comment) => comment.toDto(LectureCommentRes)),
      statistics: stats,
    });
  }
}
