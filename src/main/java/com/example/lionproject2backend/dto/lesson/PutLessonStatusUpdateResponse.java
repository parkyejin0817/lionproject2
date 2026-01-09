package com.example.lionproject2backend.dto.lesson;

import com.example.lionproject2backend.lesson.domain.LessonStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 수업 수락 응답 API
 */
@Getter
@Builder
public class PutLessonStatusUpdateResponse {

    private Long lessonId;
    private LessonStatus status;  // "APPROVED"
    private LocalDateTime updatedAt;
    private String message;  // "수업이 승인되었습니다"
}
