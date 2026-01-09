package com.example.lionproject2backend.dto.lesson;

import com.example.lionproject2backend.lesson.domain.Lesson;
import com.example.lionproject2backend.lesson.domain.LessonStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Post /api/tutorials/{tutorialId}/lessons 응답 객체
 */
@Getter
@Builder
public class PostLessonRegisterResponse {

    private Long lessonId;
    private Long tutorialId;
    private String tutorialTitle;
    private String mentorName;
    private LocalDateTime scheduledAt;
    private LessonStatus status;
    private String requestMessage;

    public static PostLessonRegisterResponse of(Lesson lesson) {
        return PostLessonRegisterResponse.builder()
                .lessonId(lesson.getId())
                .tutorialId(lesson.getTutorial().getId())
                .tutorialTitle(lesson.getTutorial().getTitle())
                .mentorName(lesson.getTutorial().getMentor().getUser().getNickname())
                .scheduledAt(lesson.getScheduledAt())
                .requestMessage(lesson.getRequestMessage())
                .build();
    }


}
