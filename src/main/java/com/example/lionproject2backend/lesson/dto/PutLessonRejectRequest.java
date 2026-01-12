package com.example.lionproject2backend.lesson.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;

/**
 * 수업 거절 API
 */

@Getter
@Builder
public class PutLessonRejectRequest {

    @NotBlank(message = "거절 사유를 입력해주세요.")
    private String rejectReason;
}
