package com.example.lionproject2backend.admin.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 거절 요청 dto
 * 멘토/환불 거절시 사유 전달
 */

@Getter
@NoArgsConstructor
public class PutRejectRequest {
    private String reason; // 거절 사유
}
