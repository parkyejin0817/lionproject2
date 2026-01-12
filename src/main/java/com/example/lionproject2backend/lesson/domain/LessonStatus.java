package com.example.lionproject2backend.lesson.domain;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum LessonStatus {

    PENDING("대기중"),
    APPROVED("승인됨"),
    REJECTED("거절됨"),
    IN_PROGRESS("진행중"),
    COMPLETED("완료됨"),
    CANCELLED("취소됨");

    private final String description;
}
