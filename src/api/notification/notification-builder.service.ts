import { Language } from '@/constants';
import { Injectable } from '@nestjs/common';
import { CouponEntity } from '../coupon/entities/coupon.entity';
import { LectureEntity } from '../course-item/lecture/entities/lecture.entity';
import { CourseEntity } from '../course/entities/course.entity';
import { EnrolledCourseEntity } from '../course/entities/enrolled-course.entity';
import { LectureCommentEntity } from '../lecture-comment/entities/lecture-comment.entity';
import { PayoutEntity } from '../payment/entities/payout.entity';
import { PayoutStatus } from '../payment/enums/payment-status.enum';
import { ReplyEntity } from '../thread/entities/reply.entity';
import { ThreadEntity } from '../thread/entities/thread.entity';
import { UserEntity } from '../user/entities/user.entity';

@Injectable()
export class NotificationBuilderService {
  courseAnnouncement(course: CourseEntity, lang?: Language) {
    let title: string, body: string;
    if (lang === Language.VI) {
      title = `Thông báo từ giảng viên `;
      body = `Thông báo mới từ khóa ${course.title}`;
    } else {
      title = `Announcement from your instructor for ${course.title}`;
      body = `New announcement for ${course.title}`;
    }
    return { title, body, image: course.thumbnail };
  }

  instructorRegistered(user: UserEntity, lang: Language = Language.VI) {
    let title: string, body: string;
    if (lang === Language.VI) {
      title = `Đăng ký trở thành giảng viên thành công`;
      body = `Chào mừng ${user.fullName}! Bạn đã đăng ký thành công làm giảng viên. Vui lòng chờ phê duyệt từ quản trị viên.`;
    } else if (lang === Language.EN) {
      title = `Instructor Registration Successful`;
      body = `Welcome ${user.fullName}! You have successfully registered as an instructor. Please wait for admin approval.`;
    }
    return { title, body };
  }

  courseEnrolled(course: CourseEntity, lang: Language = Language.VI) {
    let title: string, body: string;
    const image = course.thumbnail;
    if (lang === Language.VI) {
      title = `Bạn đã đăng ký khóa học ${course.title}`;
      body = `Bắt đầu học ngay bây giờ với ${course.title}!`;
    } else if (lang === Language.EN) {
      title = `You've enrolled in ${course.title}`;
      body = `Start your journey with ${course.title} now.`;
    }
    return { title, body, image };
  }

  courseCompleted(course: CourseEntity, lang: Language = Language.VI) {
    let title: string, body: string;
    const image = course.thumbnail;
    if (lang === Language.VI) {
      title = `Chúc mừng bạn đã hoàn thành khóa học ${course.title}`;
      body = `Bạn đã hoàn thành tất cả bài học, hãy nhận chứng chỉ ngay!`;
    } else if (lang === Language.EN) {
      title = `Congratulations on completing ${course.title}`;
      body = `You have completed all lectures! Claim your certificate now.`;
    }
    return { title, body, image };
  }

  newLectureAdded(lecture: LectureEntity, lang: Language) {
    let title: string, body: string;
    const image = lecture.section.course.thumbnail;
    if (lang === Language.VI) {
      title = `Bài giảng mới trong khóa học ${lecture.section.course.title}`;
      body = `Bài giảng <b>${lecture.title}</b> đã được thêm vào.`;
    } else if (lang === Language.EN) {
      title = `New lecture added to ${lecture.section.course.title}`;
      body = `Lecture "${lecture.title}" has been added.`;
    }
    return { title, body, image };
  }

  courseUpdated(course: CourseEntity, lang: Language = Language.VI) {
    let title: string, body: string;
    if (lang === Language.VI) {
      title = `Nội dung trong khóa học ${course.title}!`;
      body = `Khám phá ngay những mới mẻ vừa được thêm vào khóa học của bạn`;
    } else {
      title = `Exciting new content added to ${course.title}!`;
      body = `Discover the interesting and valuable knowledge just added to your course`;
    }
    return { title, body, image: course.thumbnail };
  }

  instructorAnnouncement(
    course: CourseEntity,
    announcement: string,
    lang: Language,
  ) {
    let title: string, body: string;
    if (lang === Language.VI) {
      title = `Thông báo từ giảng viên khóa ${course.title}`;
      body = `${announcement}`;
    } else {
      title = `Announcement from your instructor for ${course.title}`;
      body = `${announcement}`;
    }
    return { title, body, image: course.thumbnail };
  }

  newEnrollment(enrolled_course: EnrolledCourseEntity, lang: Language) {
    let title: string, body: string;
    if (lang === Language.VI) {
      title = `Học viên mới đăng ký vào khóa học ${enrolled_course.course.title}`;
      body = `${enrolled_course.user.fullName} vừa đăng ký vào khóa học của bạn.`;
    } else {
      title = `New enrollment in your course ${enrolled_course.course.title}`;
      body = `${enrolled_course.user.fullName} just enrolled in your course.`;
    }
    return { title, body, image: enrolled_course.user.profile_image };
  }

  courseReviewReceived(
    enrolled_course: EnrolledCourseEntity,
    lang: Language = Language.VI,
  ) {
    let title: string, body: string;
    if (lang === Language.VI) {
      title = `Khoá học ${enrolled_course.course.title} nhận được đánh giá mới`;
      body = `${enrolled_course.user.fullName} đã đánh giá ${enrolled_course.rating} sao.`;
    } else {
      title = `Your course ${enrolled_course.course.title} received a new review`;
      body = `${enrolled_course.user.fullName} rated it ${enrolled_course.rating} stars.`;
    }
    return { title, body, image: enrolled_course.user.profile_image };
  }

  courseApproved(course: CourseEntity, lang: Language) {
    let title: string, body: string;
    if (lang === Language.VI) {
      title = `Khoá học ${course.title} đã được phê duyệt`;
      body = `Khoá học của bạn đã được duyệt thành công.`;
    } else {
      title = `Your course ${course.title} has been approved`;
      body = `Congratulations! Your course is now live.`;
    }
    return { title, body, image: course.thumbnail };
  }

  courseRejected(course: CourseEntity, reason: string, lang: Language) {
    let title: string, body: string;
    if (lang === Language.VI) {
      title = `Khoá học ${course.title} bị từ chối`;
      body = `Lý do: ${reason}`;
    } else {
      title = `Your course ${course.title} was rejected`;
      body = `Reason: ${reason}`;
    }
    return { title, body, image: course.thumbnail };
  }

  payoutProcessed(payout: PayoutEntity, lang: Language = Language.VI) {
    let title: string, body: string;
    const month = payout.month;
    const year = payout.year;
    if (lang === Language.VI) {
      switch (payout.payout_status) {
        case PayoutStatus.PENDING:
          title = `Yêu cầu thanh toán đang được xử lý`;
          body = `Yêu cầu thanh toán ${payout.amount.toLocaleString('vi-VN')} VNĐ cho doanh thu tháng ${month}/${year} đang được xử lý.`;
          break;
        case PayoutStatus.SENT:
          title = `Doanh thu đã được thanh toán`;
          body = `Bạn đã nhận được ${payout.amount.toLocaleString('vi-VN')} VNĐ cho doanh thu tháng ${month}/${year}.`;
          break;
        case PayoutStatus.FAILED:
          title = `Thanh toán doanh thu thất bại`;
          body = `Thanh toán ${payout.amount.toLocaleString('vi-VN')} VNĐ cho tháng ${month}/${year} không thành công. Vui lòng liên hệ với chúng tôi để xử lý.`;
          break;
      }
    } else {
      switch (payout.payout_status) {
        case PayoutStatus.PENDING:
          title = `Payout request processing`;
          body = `Your payout request of ${payout.amount.toLocaleString('vi-VN')} VNĐ for ${month}/${year} revenue is being processed.`;
          break;
        case PayoutStatus.SENT:
          title = `Revenue payout processed`;
          body = `You have received ${payout.amount.toLocaleString('vi-VN')} VNĐ for ${month}/${year} revenue.`;
          break;
        case PayoutStatus.FAILED:
          title = `Payout failed`;
          body = `Payout of ${payout.amount.toLocaleString('vi-VN')} VNĐ for ${month}/${year} failed. Please check your information.`;
          break;
      }
    }
    return { title, body };
  }

  userReportedContent(contentType: string, lang: Language) {
    let title: string, body: string;
    if (lang === Language.VI) {
      title = `Báo cáo nội dung: ${contentType}`;
      body = `Một nội dung đã bị báo cáo cần được kiểm tra.`;
    } else {
      title = `Content Reported: ${contentType}`;
      body = `A reported content needs review.`;
    }
    return { title, body };
  }

  newCommentContent(
    lecture_comment: LectureCommentEntity,
    lang: Language = Language.VI,
  ) {
    let title: string, body: string;
    if (lang === Language.VI) {
      title = `Feedback mới từ học viên`;
      body = ` ${lecture_comment.user.last_name} feedback về bài ${lecture_comment.lecture.title} của khóa ${lecture_comment.lecture.section.course.title}`;
    } else {
      title = `New feedback on your lecture`;
      body = `${lecture_comment.user.last_name} commented on lecture ${lecture_comment.lecture.title} of course ${lecture_comment.lecture.section.course.title}`;
    }
    return {
      title,
      body,
      image: lecture_comment.user.profile_image,
    };
  }

  instructorApprovalRequest(user: UserEntity, lang: Language = Language.VI) {
    let title: string, body: string;
    if (lang === Language.VI) {
      title = `Đăng ký giảng viên`;
      body = `Người dùng ${user.fullName} đã gửi yêu cầu đăng ký trở thành giảng viên.`;
    } else {
      title = `Instructor Approval Request`;
      body = `User ${user.fullName} has sent an approval request.`;
    }
    return { title, body, image: user.profile_image };
  }

  instructorApproved(lang: Language = Language.VI) {
    let title: string, body: string;
    if (lang === Language.VI) {
      title = `Chúc mừng! Bạn đã trở thành giảng viên`;
      body = `Yêu cầu đăng ký giảng viên của bạn đã được phê duyệt. Bây giờ bạn có thể bắt đầu tạo các khóa học của mình.`;
    } else {
      title = `Congratulations! You are now an instructor`;
      body = `Your instructor registration has been approved. You can now start creating your courses.`;
    }
    return { title, body };
  }

  instructorRejected(reason: string, lang: Language = Language.VI) {
    let title: string, body: string;
    if (lang === Language.VI) {
      title = `Yêu cầu đăng ký giảng viên bị từ chối`;
      body = `Yêu cầu của bạn đã bị từ chối với lý do: ${reason}`;
    } else {
      title = `Instructor Registration Request Rejected`;
      body = `Your instructor registration request has been rejected. Reason: ${reason}`;
    }
    return { title, body };
  }

  unbanRequest(course: CourseEntity, lang: Language = Language.VI) {
    let title: string, body: string;
    if (lang === Language.VI) {
      title = `Yêu cầu mở khóa khóa học`;
      body = `Giảng viên của khóa học ${course.title} đã gửi yêu cầu mở khóa.`;
    } else {
      title = `Course Unban Request`;
      body = `The instructor of ${course.title} has requested to unban the course.`;
    }
    return { title, body, image: course.thumbnail };
  }

  payoutGenerated(
    batch: { month: number; year: number },
    lang: Language = Language.VI,
  ) {
    let title: string, body: string;
    if (lang === Language.VI) {
      title = `Thanh toán cho học viên sẵn sàng`;
      body = `Doanh thu tháng ${batch.month} năm ${batch.year} đã được tính toán và sẵn sàng để xử lý thanh toán.`;
    } else {
      title = `Thông báo thanh toán cho quản trị viên`;
      body = `Revenue for month ${batch.month} year ${batch.year} has been calculated and ready for payout processing.`;
    }
    return { title, body };
  }

  unbanApproved(course: CourseEntity, lang: Language = Language.VI) {
    let title: string, body: string;
    if (lang === Language.VI) {
      title = `Khóa học đã được mở khóa`;
      body = `Khóa học ${course.title} của bạn đã được mở khóa. Bạn có thể tiếp tục giảng dạy ngay bây giờ.`;
    } else {
      title = `Course Unbanned`;
      body = `Your course ${course.title} has been unbanned. You can now continue teaching.`;
    }
    return { title, body, image: course.thumbnail };
  }

  unbanRejected(course: CourseEntity, lang: Language = Language.VI) {
    let title: string, body: string;
    if (lang === Language.VI) {
      title = `Yêu cầu mở khóa khóa học bị từ chối`;
      body = `Yêu cầu mở khóa khóa học ${course.title} của bạn đã bị từ chối.`;
    } else {
      title = `Unban Request Rejected for ${course.title}`;
      body = `Your course ${course.title} unban request has been rejected.`;
    }
    return { title, body, image: course.thumbnail };
  }

  courseUnbanned(course: CourseEntity, lang: Language = Language.VI) {
    let title: string, body: string;
    if (lang === Language.VI) {
      title = `Khóa học đã được mở khóa`;
      body = `Nội dung khóa học đã được kiểm duyệt lại. Bạn có thể tiếp tục học khóa học ${course.title} ngay!`;
    } else {
      title = `Course Unbanned`;
      body = `The course content has been reviewed. You can now continue learning ${course.title}!`;
    }
    return { title, body, image: course.thumbnail };
  }

  couponForCourse(coupon: CouponEntity, lang: Language = Language.VI) {
    let title: string, body: string;
    const start = new Date(coupon.starts_at).toLocaleDateString();
    const due = new Date(coupon.expires_at).toLocaleDateString();

    if (lang === Language.VI) {
      title = `Mã giảm giá mới cho khóa học ${coupon.course.title}`;
      body = `Mã giảm giá ${coupon.code} cho khóa học ${coupon.course.title} có hiệu lực từ ${start} đến ${due}.`;
    } else {
      title = `New coupon for ${coupon.course.title}`;
      body = `Coupon ${coupon.code} for ${coupon.course.title} is valid from ${start} to ${due}.`;
    }
    return { title, body };
  }

  couponForAll(coupon: CouponEntity, lang: Language = Language.VI) {
    let title: string, body: string;
    const start = new Date(coupon.starts_at).toLocaleDateString();
    const due = new Date(coupon.expires_at).toLocaleDateString();
    const image = coupon.course.thumbnail;

    if (lang === Language.VI) {
      title = `Ưu đãi đặc biệt! Giảm ${coupon.value}% cho tất cả khóa học`;
      body = `Nhập mã "${coupon.code}" để được giảm ${coupon.value}% cho tất cả khóa học trên nền tảng! Ưu đãi có hiệu lực từ ${start} đến ${due}. Đừng bỏ lỡ cơ hội học tập với giá tốt nhất! 📚✨`;
    } else {
      title = `Special Offer! ${coupon.value}% OFF on All Courses`;
      body = `Use code "${coupon.code}" to get ${coupon.value}% discount on all courses across the platform! Valid from ${start} to ${due}. Don't miss this chance to learn at the best price! 📚✨`;
    }
    return { title, body, image };
  }

  newReply(reply: ReplyEntity, lang: Language = Language.VI) {
    let title: string, body: string;
    const image = reply.author.last_name;
    if (lang === Language.VI) {
      title = `Bạn có một phản hồi mới từ ${reply.author.fullName}`;
      body = `${reply.author.last_name} đã trả lời câu hỏi của bạn trên bài giảng ${reply.thread.lecture.title}.`;
    } else {
      title = `You have a new reply from ${reply.author.fullName}`;
      body = `You have a new reply from ${reply.author.last_name} in your comment on lecture ${reply.thread.lecture.title}.`;
    }
    return { title, body, image };
  }

  newThread(thread: ThreadEntity, lang: Language = Language.VI) {
    let title: string, body: string;
    const image = thread.author.last_name;
    if (lang === Language.VI) {
      title = `Bạn có một câu hỏi mới từ ${thread.author.fullName}`;
      body = `${thread.author.last_name} đã đặt câu hỏi trong bài giảng ${thread.lecture.title}.`;
    } else {
      title = `You have a new question from ${thread.author.fullName}`;
      body = `You have a new question from ${thread.author.last_name} about lecture ${thread.lecture.title}.`;
    }
    return { title, body, image };
  }

  courseBanned(course: CourseEntity, lang: Language = Language.VI) {
    let title: string, body: string;
    if (lang === Language.VI) {
      title = `Khóa học bị cấm`;
      body = `Khóa học ${course.title} của bạn đã bị cấm.`;
    } else {
      title = `Course Banned`;
      body = `Your course ${course.title} has been banned.`;
    }
    return { title, body, image: course.thumbnail };
  }
}
