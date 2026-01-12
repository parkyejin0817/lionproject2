package com.example.lionproject2backend.lesson.dto;

import com.example.lionproject2backend.lesson.domain.Lesson;
import com.example.lionproject2backend.lesson.domain.LessonStatus;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Post /api/tutorials/{tutorialId}/lessons - 수업신청 응답 객체
 */
@Getter
@Builder(access = AccessLevel.PRIVATE)
public class PostLessonRegisterResponse {

    private Long lessonId;
    private Long tutorialId;
    private String tutorialTitle;
    private String mentorName;
    private LocalDateTime scheduledAt;
    private LessonStatus status;
    private String requestMessage;

    public static PostLessonRegisterResponse from(Lesson lesson) {
        return PostLessonRegisterResponse.builder()
                .lessonId(lesson.getId())
                .tutorialId(lesson.getTutorial().getId())
                .tutorialTitle(lesson.getTutorial().getTitle())
                .mentorName(lesson.getTutorial().getMentor().getUser().getNickname())
                .scheduledAt(lesson.getScheduledAt())
                .status(lesson.getStatus())
                .requestMessage(lesson.getRequestMessage())
                .build();
    }


}
