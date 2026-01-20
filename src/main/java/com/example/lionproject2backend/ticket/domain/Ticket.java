package com.example.lionproject2backend.ticket.domain;

import com.example.lionproject2backend.global.domain.BaseEntity;
import com.example.lionproject2backend.lesson.domain.Lesson;
import com.example.lionproject2backend.payment.domain.Payment;
import com.example.lionproject2backend.tutorial.domain.Tutorial;
import com.example.lionproject2backend.user.domain.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tickets")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Ticket extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", nullable = false)
    private Payment payment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutorial_id", nullable = false)
    private Tutorial tutorial;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentee_id", nullable = false)
    private User mentee;

    @Column(name = "total_count", nullable = false)
    private int totalCount;

    @Column(name = "remaining_count", nullable = false)
    private int remainingCount;

    @Column(name = "expired_at")
    private LocalDateTime expiredAt;

    public static Ticket create(Payment payment, Tutorial tutorial, User mentee, int count) {
        Ticket ticket = new Ticket();
        ticket.payment = payment;
        ticket.tutorial = tutorial;
        ticket.mentee = mentee;
        ticket.totalCount = count;
        ticket.remainingCount = count;
        ticket.expiredAt = LocalDateTime.now().plusMonths(6);
        return ticket;
    }

    public void use() {
        if (this.remainingCount <= 0) {
            throw new IllegalStateException("남은 이용권이 없습니다");
        }
        if (isExpired()) {
            throw new IllegalStateException("이용권이 만료되었습니다.");
        }
        this.remainingCount--;
    }

    public void restore() {
        if (this.remainingCount >= this.totalCount) {
            throw new IllegalStateException("복구할 수 없습니다");
        }
        this.remainingCount++;
    }

    public boolean isExpired() {
        return expiredAt != null && LocalDateTime.now().isAfter(expiredAt);
    }

    public boolean hasRemaining() {
        return this.remainingCount > 0 && !isExpired();
    }

    public boolean hasBeenUsed() {
        return this.remainingCount < this.totalCount;
    }

    public void validateRefund() {
        if (hasBeenUsed()) {
            throw new IllegalStateException("한 번이라도 사용된 티켓은 환불할 수 없습니다");
        }
        if (isExpired()) {
            throw new IllegalStateException("만료된 이용권은 환불할 수 없습니다");
        }
        if (this.remainingCount <= 0) {
            throw new IllegalStateException("환불 가능한 티켓이 없습니다");
        }
    }

    public int calculateRefundAmount() {
        return this.payment.getAmount();
    }

    public void invalidate() {
        this.remainingCount = 0;
        this.expiredAt = LocalDateTime.now();
    }
}
