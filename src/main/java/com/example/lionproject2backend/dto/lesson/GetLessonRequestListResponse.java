package com.example.lionproject2backend.dto.lesson;

import com.example.lionproject2backend.lesson.domain.LessonStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 신청된 수업 목록 조회
 */
@Getter
@Builder
public class GetLessonRequestListResponse {
    private List<LessonRequestItem> requests;

    @Getter
    @Builder
    public static class LessonRequestItem {
        private Long lessonId;
        private Long tutorialId;
        private String tutorialTitle;
        private String menteeName;
        private String menteeEmail;
        private LocalDateTime scheduledAt;
        private String requestMessage;
        private LessonStatus status;
        private LocalDateTime createdAt;
    }

}
