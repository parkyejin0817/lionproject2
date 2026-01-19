package com.example.lionproject2backend.payment.domain;

public enum PaymentStatus {
    PENDING,
    PAID,
    CANCELLED,
    REFUND_REQUESTED,    // 환불 요청 대기
    REFUNDED,            // 환불 완료
    REFUND_REJECTED      // 환불 거절
}
