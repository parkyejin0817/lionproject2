package com.example.lionproject2backend.ticket.domain;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum TicketStatus {
    PENDING("사용안함"), ACTIVE("사용중"), EXPIRED("만료됨"), USED("사용완료"), CANCELLED("취소됨");

    private final String description;
}
