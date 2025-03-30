import {
  CreateQuizQuestionReq,
  CreateQuizReq,
  QuizQuestionType,
  QuizRes,
  UpdateQuizAnswerReq,
  UpdateQuizQuestionReq,
  UpdateQuizReq,
} from '@/api/course-item';
import { ArticleEntity } from '@/api/course-item/article/article.entity';
import { CourseItemService } from '@/api/course-item/course-item.service';
import { LectureEntity } from '@/api/course-item/lecture/lecture.entity';
import { QuizQuestionEntity } from '@/api/course-item/quiz/entities/quiz-question.entity';
import { QuizEntity } from '@/api/course-item/quiz/entities/quiz.entity';
import { MediaRepository } from '@/api/media';
import { SectionRepository } from '@/api/section/section.repository';
import { JwtPayloadType } from '@/api/token';
import { Nanoid } from '@/common';
import { ErrorCode, Permission } from '@/constants';
import { NotFoundException, ValidationException } from '@/exceptions';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizAnswerEntity } from './entities/quiz-answer.entity';

@Injectable()
export class QuizService extends CourseItemService {
  constructor(
    sectionRepository: SectionRepository,
    lectureRepository: Repository<LectureEntity>,
    articleRepository: Repository<ArticleEntity>,
    quizRepository: Repository<QuizEntity>,
    mediaRepository: MediaRepository,
    @InjectRepository(QuizQuestionEntity)
    private readonly questionRepository: Repository<QuizQuestionEntity>,
    @InjectRepository(QuizAnswerEntity)
    private readonly answerRepository: Repository<QuizAnswerEntity>,
  ) {
    super(
      sectionRepository,
      lectureRepository,
      articleRepository,
      quizRepository,
      mediaRepository,
    );
  }

  async findOne(user: JwtPayloadType, id: Nanoid) {
    if (user.permissions.includes(Permission.READ_COURSE_ITEM))
      return (await this.findOneById(id)).toDto(QuizRes);
    const quiz = await this.quizRepository.findOne({
      where: {
        id,
        section: { course: { enrolled_users: { user: { id: user.id } } } },
      },
      relations: {
        questions: { answers: true },
        section: { course: { enrolled_users: { user: true } } },
      },
    });
    if (!quiz)
      throw new NotFoundException(
        ErrorCode.E033,
        'Quiz not found or user has not registered the course',
      );
    return quiz.toDto(QuizRes);
  }

  async findOneById(id: Nanoid) {
    const quiz = await this.quizRepository.findOne({
      where: { id },
      relations: { questions: { answers: true } },
    });
    if (!quiz) throw new NotFoundException(ErrorCode.E033, 'Quiz not found');
    return quiz;
  }

  async create(user: JwtPayloadType, dto: CreateQuizReq) {
    // get section
    const section = await this.sectionRepository.findOne({
      where: { id: dto.section.id },
      relations: { course: { instructor: { user: true } } },
    });
    this.isValidSection(user, section);

    // get position
    const position = await this.getPosition(
      dto.previous_position,
      section.section_id,
    );

    // check answers
    dto.questions.forEach((question) => this.isValidQuestion(question));

    const quiz = this.quizRepository.create({
      ...dto,
      position,
      section,
    });

    await this.quizRepository.save(quiz);

    return quiz.toDto(QuizRes);
  }

  async update(user: JwtPayloadType, id: Nanoid, dto: UpdateQuizReq) {
    const quiz = await this.findOneById(id);

    const {
      section,
      previous_position,
      questions: questions_dto,
      ...rest
    } = dto;

    // get section
    if (section?.id != undefined && section?.id !== quiz.section.id) {
      const new_section = await this.sectionRepository.findOne({
        where: { id: dto.section.id },
        relations: { course: { instructor: { user: true } } },
      });
      this.isValidSection(user, new_section);
      quiz.section = new_section;
    }

    // get position
    if (previous_position != undefined) {
      const position = await this.getPosition(
        dto.previous_position,
        quiz.section.section_id,
      );
      quiz.position = position;
    }

    Object.assign(quiz, { ...rest });

    if (questions_dto) {
      const { save_questions, remove_questions, remove_answers } =
        this.getUpdateQuestionList(questions_dto, quiz.questions);
      quiz.questions = save_questions;
      quiz.update_content_at = new Date();

      await this.questionRepository.softRemove(remove_questions);
      await this.answerRepository.softRemove(remove_answers);
    }

    await this.quizRepository.save(quiz);

    return quiz.toDto(QuizRes);
  }

  private getUpdateAnswerList(
    answers_dto: UpdateQuizAnswerReq[],
    answers: QuizAnswerEntity[],
  ) {
    // Create a Map for quick lookup of existing answers
    const answer_map = new Map(answers.map((a) => [a.id, a]));

    const save_answers = answers_dto.map((answer_dto) => {
      const existing_answer = answer_map.get(answer_dto.id);

      if (existing_answer) {
        Object.assign(existing_answer, answer_dto);
        answer_map.delete(answer_dto.id);
        return existing_answer;
      } else {
        const new_answer = new QuizAnswerEntity({
          ...answer_dto,
          quiz_question_id: answers[0].quiz_question_id,
        });
        return new_answer;
      }
    });

    const remove_answers = Array.from(answer_map.values());
    return { save_answers, remove_answers };
  }

  private getUpdateQuestionList(
    questions_dto: UpdateQuizQuestionReq[],
    questions: QuizQuestionEntity[],
  ) {
    // Create a Map for quick lookup of existing questions
    const question_map = new Map(questions.map((q) => [q.id, q]));

    const remove_answers: QuizAnswerEntity[] = [];
    const save_questions = questions_dto.map((question_dto) => {
      this.isValidQuestion(question_dto);
      const existing_question = question_map.get(question_dto.id);
      if (!existing_question) {
        const new_question = this.questionRepository.create(question_dto);
        return new_question;
      } // New question
      else {
        const { save_answers, remove_answers: r_a } = this.getUpdateAnswerList(
          question_dto.answers,
          existing_question.answers,
        );
        remove_answers.push(...r_a);

        Object.assign(existing_question, question_dto, {
          answers: save_answers,
        });
        question_map.delete(question_dto.id);
        return existing_question;
      }
    });
    const remove_questions = Array.from(question_map.values());
    return {
      remove_questions,
      remove_answers,
      save_questions,
    };
  }

  private isValidQuestion(question: CreateQuizQuestionReq) {
    if (question.answers.length < 2 || question.answers.length > 4)
      throw new ValidationException(ErrorCode.E036);
    const correct_answers_count = question.answers.filter(
      (answer) => answer.is_correct,
    ).length;
    if (question.type == QuizQuestionType.MULTIPLE && correct_answers_count < 2)
      throw new ValidationException(ErrorCode.E037);

    if (question.type == QuizQuestionType.SINGLE && correct_answers_count != 1)
      throw new ValidationException(ErrorCode.E037);
  }
}
