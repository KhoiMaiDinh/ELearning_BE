import { Language } from '@/constants';
import { Injectable } from '@nestjs/common';
import { CouponEntity } from '../coupon/entities/coupon.entity';
import { LectureEntity } from '../course-item/lecture/lecture.entity';
import { CourseEntity } from '../course/entities/course.entity';
import { EnrolledCourseEntity } from '../course/entities/enrolled-course.entity';
import { LectureCommentEntity } from '../lecture-comment/entities/lecture-comment.entity';
import { PayoutEntity } from '../payment/entities/payout.entity';

@Injectable()
export class NotificationBuilderService {
  courseEnrolled(course: CourseEntity, lang: Language) {
    let title: string, body: string;
    if (lang === Language.VI) {
      title = `Bạn đã đăng ký khóa học ${course.title}`;
      body = `Bắt đầu học ngay bây giờ với ${course.title}!`;
    } else if (lang === Language.EN) {
      title = `You've enrolled in ${course.title}`;
      body = `Start your journey with ${course.title} now.`;
    }
    return { title, body };
  }

  courseCompleted(course: CourseEntity, lang: Language) {
    if (lang === Language.VI) {
      return {
        title: `Chúc mừng bạn đã hoàn thành khóa học ${course.title}`,
        body: `Bạn đã hoàn thành tất cả bài học, hãy nhận chứng chỉ ngay!`,
      };
    }
    return {
      title: `Congratulations on completing ${course.title}`,
      body: `You have completed all lectures! Claim your certificate now.`,
    };
  }

  newLectureAdded(lecture: LectureEntity, lang: Language) {
    if (lang === Language.VI) {
      return {
        title: `Bài giảng mới trong khóa học ${lecture.section.course.title}`,
        body: `Bài giảng <b>${lecture.title}</b> đã được thêm vào.`,
      };
    }
    return {
      title: `New lecture added to ${lecture.section.course.title}`,
      body: `Lecture "${lecture.title}" has been added.`,
    };
  }

  courseUpdated(course: CourseEntity, lang: Language) {
    if (lang === Language.VI) {
      return {
        title: `Khóa học ${course.title} đã được cập nhật`,
        body: `Hãy kiểm tra những nội dung mới vừa được thêm vào.`,
      };
    }
    return {
      title: `${course.title} has been updated`,
      body: `Check out the new updates added to the course.`,
    };
  }

  courseDiscountAvailable(
    course: CourseEntity,
    coupon: CouponEntity,
    lang: Language,
  ) {
    if (lang === Language.VI) {
      return {
        title: `Ưu đãi ${coupon.value}% cho khóa học ${course.title}`,
        body: `Nhanh tay đăng ký ngay hôm nay để nhận ưu đãi!`,
      };
    }
    return {
      title: `${coupon.value}% discount available for ${course.title}`,
      body: `Enroll today to grab the special offer!`,
    };
  }

  instructorAnnouncement(
    course: CourseEntity,
    announcement: string,
    lang: Language,
  ) {
    if (lang === Language.VI) {
      return {
        title: `Thông báo từ giảng viên khóa ${course.title}`,
        body: `${announcement}`,
      };
    }
    return {
      title: `Announcement from your instructor for ${course.title}`,
      body: `${announcement}`,
    };
  }

  newEnrollment(enrolled_course: EnrolledCourseEntity, lang: Language) {
    if (lang === Language.VI) {
      return {
        title: `Học viên mới đăng ký vào khóa học ${enrolled_course.course.title}`,
        body: `${enrolled_course.user.fullName} vừa đăng ký vào khóa học của bạn.`,
      };
    }
    return {
      title: `New enrollment in your course ${enrolled_course.course.title}`,
      body: `${enrolled_course.user.fullName} just enrolled in your course.`,
    };
  }

  courseReviewReceived(enrolled_course: EnrolledCourseEntity, lang: Language) {
    if (lang === Language.VI) {
      return {
        title: `Khoá học ${enrolled_course.course.title} nhận được đánh giá mới`,
        body: `${enrolled_course.user.fullName} đã đánh giá ${enrolled_course.rating} sao.`,
      };
    }
    return {
      title: `Your course ${enrolled_course.course.title} received a new review`,
      body: `${enrolled_course} rated it ${enrolled_course.rating} stars.`,
    };
  }

  courseApproved(course: CourseEntity, lang: Language) {
    if (lang === Language.VI) {
      return {
        title: `Khoá học ${course.title} đã được phê duyệt`,
        body: `Khoá học của bạn đã được duyệt thành công.`,
      };
    }
    return {
      title: `Your course ${course.title} has been approved`,
      body: `Congratulations! Your course is now live.`,
    };
  }

  courseRejected(course: CourseEntity, reason: string, lang: Language) {
    if (lang === Language.VI) {
      return {
        title: `Khoá học ${course.title} bị từ chối`,
        body: `Lý do: ${reason}`,
      };
    }
    return {
      title: `Your course ${course.title} was rejected`,
      body: `Reason: ${reason}`,
    };
  }

  payoutProcessed(payout: PayoutEntity, lang: Language) {
    if (lang === Language.VI) {
      return {
        title: `Thanh toán doanh thu thành công`,
        body: `Bạn đã nhận được ${payout.amount.toLocaleString('vi-VN')} VNĐ.`,
      };
    }
    return {
      title: `Revenue payout processed`,
      body: `You have received ${payout.amount.toLocaleString('vi-VN')} VNĐ.`,
    };
  }

  userReportedContent(contentType: string, lang: Language) {
    if (lang === Language.VI) {
      return {
        title: `Báo cáo nội dung: ${contentType}`,
        body: `Một nội dung đã bị báo cáo cần được kiểm tra.`,
      };
    }
    return {
      title: `Content Reported: ${contentType}`,
      body: `A reported content needs review.`,
    };
  }

  newCommentContent(lecture_comment: LectureCommentEntity, lang: Language) {
    if (lang === Language.VI) {
      return {
        title: `Bình luận mới về bài giảng ${lecture_comment.lecture.title} của khóa học ${lecture_comment.lecture.section.course.title}`,
        body: `${lecture_comment.content.slice(0, 50)}...`,
      };
    }
    return {
      title: `New comment on your lecture ${lecture_comment.lecture.title} of course ${lecture_comment.lecture.section.course.title}`,
      body: `${lecture_comment.content.slice(0, 50)}...`,
    };
  }
}
