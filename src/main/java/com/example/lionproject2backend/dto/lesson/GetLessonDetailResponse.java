package com.example.lionproject2backend.dto.lesson;

import com.example.lionproject2backend.lesson.domain.LessonStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 수업 상세 조회
 */
@Getter
@Builder
public class GetLessonDetailResponse {

    // 수업 기본 정보
    private Long lessonId;
    private LessonStatus status;
    private LocalDateTime scheduledAt;
    private LocalDateTime completedAt;
    private String requestMessage;

    // 과외 정보
    private TutorialInfo tutorial;

    // 멘토 정보
    private MentorInfo mentor;

    // 멘티 정보
    private MenteeInfo mentee;

    // 결제 정보
    private PaymentInfo payment;

    // 질문 개수
    private int questionCount;

    // 리뷰 여부
    private boolean hasReview;

    @Getter
    @Builder
    public static class TutorialInfo {
        private Long tutorialId;
        private String title;
        private String description;
        private int price;
        private int duration;
    }

    @Getter
    @Builder
    public static class MentorInfo {
        private Long mentorId;
        private String name;
        private String introduction;
        private List<String> skills;
    }

    @Getter
    @Builder
    public static class MenteeInfo {
        private Long menteeId;
        private String name;
        private String email;
    }

    @Getter
    @Builder
    public static class PaymentInfo {
        private Long paymentId;
        private int amount;
        private String paymentStatus;
        private LocalDateTime paidAt;
    }

}
