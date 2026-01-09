package com.example.lionproject2backend.dto.lesson;

import com.example.lionproject2backend.lesson.domain.LessonStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 수업목록 조회 (멘티)
 */
@Getter
@Builder
public class GetLessonListResponse {

    private List<MyLessonItem> lessons;

    @Getter
    @Builder
    public static class MyLessonItem {
        private Long lessonId;
        private Long tutorialId;
        private String tutorialTitle;
        private String mentorName;
        private LocalDateTime scheduledAt;
        private LessonStatus status;
        private LocalDateTime createdAt;
    }
}
