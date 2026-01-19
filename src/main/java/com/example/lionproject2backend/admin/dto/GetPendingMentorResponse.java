package com.example.lionproject2backend.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 승인 대기 중인 멘토 목록 응답 DTO
 */
@Getter
@AllArgsConstructor
public class GetPendingMentorResponse {

    private Long mentorId;
    private Long userId;
    private String nickname;
    private String email;
    private String career;
    private LocalDateTime createdAt;
}
