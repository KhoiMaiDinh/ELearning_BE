import { QuizEntity } from '@/api/course-item/quiz/entities/quiz.entity';
import { EnrolledCourseRepository } from '@/api/course/repositories/enrolled-course.repository';
import { JwtPayloadType } from '@/api/token';
import { Nanoid } from '@/common';
import { ErrorCode } from '@/constants';
import { ForbiddenException, ValidationException } from '@/exceptions';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { QuizAttemptRes } from '../dto/quiz-attempt.res';
import { SubmitQuizReq } from '../dto/submit-quiz.req.dto';
import { QuizAnswerEntity } from './entities/quiz-answer.entity';
import {
  QuizAttempt,
  QuizAttemptAnswer,
  QuizAttemptQuestion,
} from './entities/quiz-attempt.entity';

@Injectable()
export class QuizAttemptService {
  constructor(
    private readonly enrolledCourseRepository: EnrolledCourseRepository,
    @InjectRepository(QuizEntity)
    private readonly quizRepository: Repository<QuizEntity>,
    @InjectRepository(QuizAttempt)
    private readonly attemptRepository: Repository<QuizAttempt>,
  ) {}

  async getByQuiz(user: JwtPayloadType, id: Nanoid) {
    const attempts = await this.attemptRepository
      .createQueryBuilder('attempt')
      .leftJoinAndSelect('attempt.user', 'user')
      .leftJoinAndSelect('attempt.quiz', 'quiz')
      .leftJoinAndSelect('attempt.questions', 'questions')
      .where('user.id = :user_id', { user_id: user.id })
      .andWhere('quiz.id = :quiz_id', { quiz_id: id })
      .addSelect(
        `(SELECT COUNT(*) FROM "quiz-attempt-question" q WHERE q.quiz_attempt_id = attempt.quiz_attempt_id AND q.is_correct = true)`,
        'score',
      )
      .orderBy('score', 'DESC')
      .addOrderBy('attempt.createdAt', 'DESC') // Fallback order by latest attempt
      .getMany();

    return plainToInstance(QuizAttemptRes, attempts);
  }

  async submit(user: JwtPayloadType, id: Nanoid, dto: SubmitQuizReq) {
    const quiz = await this.quizRepository.findOne({
      where: { id },
      relations: ['questions', 'questions.answers', 'section'],
    });
    if (!quiz) {
      throw new NotFoundException(ErrorCode.E033, 'Quiz not found');
    }

    const enrolled_course = await this.enrolledCourseRepository.findOne({
      where: {
        user: { id: user.id },
        course_id: quiz.section.course_id,
      },
      relations: { user: true },
    });

    if (!enrolled_course) {
      throw new ForbiddenException(
        ErrorCode.E038,
        'User has not enrolled the course',
      );
    }

    const question_map = new Map(quiz.questions.map((q) => [q.id, q]));

    // look up questions
    const attempt_questions = dto.questions.map((question) => {
      const existing_question = question_map.get(question.id);
      if (!existing_question) {
        throw new NotFoundException(ErrorCode.E033, 'Question not found');
      }

      const { attempt_answers, is_correct } = this.getAttemptAnswerAndResult(
        existing_question.answers,
        question.answer_ids,
      );

      const attempt_question = new QuizAttemptQuestion({
        question: existing_question.question,
        answers: attempt_answers,
        is_correct,
      });

      question_map.delete(question.id);
      return attempt_question;
    });

    if (question_map.size > 0) {
      throw new ValidationException(ErrorCode.E039);
    }

    const attempt = this.attemptRepository.create({
      user_id: enrolled_course.user_id,
      quiz_id: quiz.quiz_id,
      version_date: quiz.update_content_at,
      questions: attempt_questions,
    });

    await this.attemptRepository.save(attempt);

    return attempt.toDto(QuizAttemptRes);
  }

  private getAttemptAnswerAndResult(
    answers: QuizAnswerEntity[],
    input_answer_ids: Nanoid[],
  ): { attempt_answers: QuizAttemptAnswer[]; is_correct: boolean } {
    let is_correct = true;
    const attempt_answers = answers.map((answer) => {
      const is_selected = input_answer_ids.includes(answer.id);
      if (
        (is_selected && !answer.is_correct) ||
        (!is_selected && answer.is_correct)
      )
        is_correct = false;

      return {
        answer: answer.answer,
        is_correct: answer.is_correct,
        is_selected,
      };
    });
    return { attempt_answers, is_correct };
  }
}
