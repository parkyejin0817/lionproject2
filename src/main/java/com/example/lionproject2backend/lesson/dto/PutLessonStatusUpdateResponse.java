package com.example.lionproject2backend.lesson.dto;

import com.example.lionproject2backend.lesson.domain.Lesson;
import com.example.lionproject2backend.lesson.domain.LessonStatus;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Put /api/lessons/{lessonId}/accept - 수업 수락
 *
 * query
 * UPDATE lessons
 * SET status = 'APPROVED',
 * updated_at = NOW(),
 * WHERE id = ?
 * AND status = 'PENDING'
 */
@Getter
@Builder(access = AccessLevel.PRIVATE)
public class PutLessonStatusUpdateResponse {

    private Long lessonId;
    private LessonStatus status;  // "APPROVED"
    private LocalDateTime updatedAt;

    public static PutLessonStatusUpdateResponse from(Lesson lesson) {
        return PutLessonStatusUpdateResponse.builder()
                .lessonId(lesson.getId())
                .status(lesson.getStatus())
                .updatedAt(lesson.getUpdatedAt())
                .build();
    }
}
