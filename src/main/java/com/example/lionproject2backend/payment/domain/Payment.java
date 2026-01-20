package com.example.lionproject2backend.payment.domain;

import com.example.lionproject2backend.global.domain.BaseEntity;
import com.example.lionproject2backend.global.exception.custom.CustomException;
import com.example.lionproject2backend.global.exception.custom.ErrorCode;
import com.example.lionproject2backend.tutorial.domain.Tutorial;
import com.example.lionproject2backend.user.domain.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Payment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutorial_id", nullable = false)
    private Tutorial tutorial;

    @Column(name = "imp_uid")
    private String impUid;

    @Column(name = "merchant_uid")
    private String merchantUid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentee_id", nullable = false)
    private User mentee;

    @Column(nullable = false)
    private int amount;

    @Column(name = "count", nullable = false)
    private int count;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private PaymentStatus status;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "refunded_amount", nullable = false)
    @ColumnDefault("0")
    private Integer refundedAmount = 0;

    @Column(name = "refunded_at")
    private LocalDateTime refundedAt;

    public static Payment create(Tutorial tutorial, User mentee, int count) {
        Payment payment = new Payment();
        payment.tutorial = tutorial;
        payment.mentee = mentee;
        payment.count = count;
        payment.amount = tutorial.getPrice() * count;
        payment.status = PaymentStatus.PENDING;
        return payment;
    }

    public void complete(String impUid, String merchantUid) {
        if (this.status != PaymentStatus.PENDING) {
            throw new CustomException(ErrorCode.PAYMENT_CANNOT_COMPLETE);
        }
        this.impUid = impUid;
        this.merchantUid = merchantUid;
        this.status = PaymentStatus.PAID;
        this.paidAt = LocalDateTime.now();
    }

    public void cancel() {
        if (this.status == PaymentStatus.PAID) {
            throw new CustomException(ErrorCode.PAYMENT_CANNOT_CANCEL);
        }
        this.status = PaymentStatus.CANCELLED;
    }

    public void requestRefund() {
        if (this.status != PaymentStatus.PAID) {
            throw new CustomException(ErrorCode.PAYMENT_CANNOT_REQUEST_REFUND);
        }
        this.status = PaymentStatus.REFUND_REQUESTED;
    }

    public void rejectRefund() {
        if (this.status != PaymentStatus.REFUND_REQUESTED) {
            throw new CustomException(ErrorCode.PAYMENT_CANNOT_REJECT_REFUND);
        }
        this.status = PaymentStatus.REFUND_REJECTED;
    }

    public void cancelRefundRequest() {
        if (this.status != PaymentStatus.REFUND_REQUESTED) {
            throw new CustomException(ErrorCode.PAYMENT_CANNOT_CANCEL_REFUND_REQUEST);
        }
        this.status = PaymentStatus.PAID;
    }

    public void validateRefund(int refundAmount) {
        if (this.status != PaymentStatus.REFUND_REQUESTED) {
            throw new CustomException(ErrorCode.PAYMENT_CANNOT_PROCESS_REFUND);
        }

        if (refundAmount != this.amount) {
            throw new CustomException(ErrorCode.PAYMENT_INVALID_REFUND_AMOUNT);
        }
    }

    public void applyRefund(int refundAmount) {
        this.refundedAmount = refundAmount;
        this.refundedAt = LocalDateTime.now();
        this.status = PaymentStatus.REFUNDED;
    }
}
