package com.example.lionproject2backend.lesson.dto;

import com.example.lionproject2backend.lesson.domain.Lesson;
import com.example.lionproject2backend.lesson.domain.LessonStatus;
import com.example.lionproject2backend.mentor.domain.Mentor;
import com.example.lionproject2backend.tutorial.domain.Tutorial;
import com.example.lionproject2backend.user.domain.User;
import com.example.lionproject2backend.user.domain.UserRole;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Get /api/lessons/{lessonId} - 수업 상세 조회
 */
@Getter
@Builder(access = AccessLevel.PRIVATE)
public class GetLessonDetailResponse {

    // 수업 기본 정보
    private Long lessonId;
    private LessonStatus status;
    private LocalDateTime scheduledAt;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private String requestMessage;
    private String rejectReason;

    // 과외 정보
    private TutorialInfo tutorial;

    // 멘토 정보
    private MentorInfo mentor;

    // 멘티 정보
    private MenteeInfo mentee;

    // 현재 사용자 역할 정보
    private UserRole userRole;

    /**
     * Lesson 엔티티 -> GetLessonDetailResponse 로 변환
     * @param lesson 수업 엔티티
     * @param userId 현재 사용자 ID 역할 판단용
     */
    public static GetLessonDetailResponse from(Lesson lesson, Long userId) {
        UserRole userRole = lesson.isMentor(userId) ? UserRole.MENTOR : UserRole.MENTEE;

        return GetLessonDetailResponse.builder()
                .lessonId(lesson.getId())
                .status(lesson.getStatus())
                .scheduledAt(lesson.getScheduledAt())
                .createdAt(lesson.getCreatedAt())
                .completedAt(lesson.getCompletedAt())
                .requestMessage(lesson.getRequestMessage())
                .rejectReason(lesson.getRejectReason())
                .tutorial(TutorialInfo.from(lesson.getTutorial()))
                .mentor(MentorInfo.from(lesson.getTutorial().getMentor()))
                .mentee(MenteeInfo.from(lesson.getMentee()))
                .userRole(userRole)
                .build();
    }

    //과외 정보
    @Getter
    @Builder(access = AccessLevel.PRIVATE)
    public static class TutorialInfo {
        private Long tutorialId;
        private String title;
        private String description;
        private int price;
        private int duration;

        public static TutorialInfo from(Tutorial tutorial) {
            return TutorialInfo.builder()
                    .tutorialId(tutorial.getId())
                    .title(tutorial.getTitle())
                    .description(tutorial.getDescription())
                    .price(tutorial.getPrice())
                    .duration(tutorial.getDuration())
                    .build();
        }
    }

    //멘토 정보
    @Getter
    @Builder(access = AccessLevel.PRIVATE)
    public static class MentorInfo {
        private Long mentorId;
        private String name;
        private String email;
        private String career;

        public static MentorInfo from(Mentor mentor) {
            return MentorInfo.builder()
                    .mentorId(mentor.getId())
                    .name(mentor.getUser().getNickname())
                    .email(mentor.getUser().getEmail())
                    .career(mentor.getCareer())
                    .build();
        }
    }

    //멘티 정보
    @Getter
    @Builder(access = AccessLevel.PRIVATE)
    public static class MenteeInfo {
        private Long menteeId;
        private String name;
        private String email;

        public static MenteeInfo from(User mentee) {
            return MenteeInfo.builder()
                    .menteeId(mentee.getId())
                    .name(mentee.getNickname())
                    .email(mentee.getEmail())
                    .build();
        }
    }

//
//    @Getter
//    @Builder
//    public static class PaymentInfo {
//        private Long paymentId;
//        private int amount;
//        private String paymentStatus;
//        private LocalDateTime paidAt;
//    }

}
