package com.example.lionproject2backend.lesson.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Post /api/tutorials/{tutorialId}/lessons - 수업신청 요청 객체
 */
@Getter
@NoArgsConstructor
public class PostLessonRegisterRequest {

    @NotNull(message = "수업 날짜를 선택해주세요")
    private LocalDate lessonDate;

    @NotNull(message = "수업 시간을 선택해주세요")
    private LocalTime lessonTime;

    private String requestMessage;
}
