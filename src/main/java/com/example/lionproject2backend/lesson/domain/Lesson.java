package com.example.lionproject2backend.lesson.domain;

import com.example.lionproject2backend.global.domain.BaseEntity;
import com.example.lionproject2backend.tutorial.domain.Tutorial;
import com.example.lionproject2backend.user.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "lessons")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Lesson extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutorial_id", nullable = false)
    private Tutorial tutorial;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentee_id", nullable = false)
    private User mentee;

    @Enumerated(EnumType.STRING)
    @Column(name = "status",nullable = false, length = 20)
    private LessonStatus status;

    @Column(name = "request_message", columnDefinition = "TEXT")
    private String requestMessage;

    @Column(name = "scheduled_at", nullable = false)
    private LocalDateTime scheduledAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    //추가 컬럼
    @Column(name = "reject_reason", columnDefinition = "TEXT")
    private String rejectReason;


    @Builder(access = AccessLevel.PRIVATE)
    private Lesson(Tutorial tutorial, User mentee, String requestMessage, LocalDateTime scheduledAt) {
        validateScheduledTime(scheduledAt);
        this.tutorial = tutorial;
        this.mentee = mentee;
        this.requestMessage = requestMessage;
        this.scheduledAt = scheduledAt;
        this.status = LessonStatus.PENDING;
    }

    /**
     * 생성 메서드
     * - 정적 팩토리 메서드 + Builder 패턴 적용
     * - 생성 책임을 외부로부터 분리, 생성 파라미터 확장에 유연하게 대응
     *   -> 생성 로직 캡슐화 및 확장성 확보
     */
    public static Lesson register(Tutorial tutorial, User mentee, String requestMessage, LocalDateTime scheduledAt) {
        return Lesson.builder()
                .tutorial(tutorial)
                .mentee(mentee)
                .requestMessage(requestMessage)
                .scheduledAt(scheduledAt)
                .build();
    }

    private static void validateScheduledTime(LocalDateTime scheduledAt) {
        if(scheduledAt.isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("과거 시간으로 예약할 수 없습니다");
        }
    }

    // =============== 비즈니스 로직 메서드 =============== //

    /**
     * 수업 승인 (멘토)
     */
    public void approve(Long mentorId){
        validateMentorAuthority(mentorId);
        validateStatusTransition(LessonStatus.PENDING, "승인");
        this.status = LessonStatus.APPROVED;
    }

    /**
     * 수업 거절 (멘토)
     * - rejectReason 검증, 상태 검증필요
     */
    public void reject(Long mentorId, String rejectReason){
        validateMentorAuthority(mentorId);

        if (rejectReason == null || rejectReason.isBlank()) {
            throw new IllegalArgumentException("거절 사유를 입력해주세요");
        }

        validateStatusTransition(LessonStatus.PENDING, "거절");
        this.status = LessonStatus.REJECTED;
        this.rejectReason = rejectReason;
    }

    /**
     * 수업 시작 (멘토)
     */
    public void start(Long mentorId){
        validateMentorAuthority(mentorId);
        validateStatusTransition(LessonStatus.APPROVED, "시작");
        this.status = LessonStatus.IN_PROGRESS;
    }

    /**
     * 수업 완료 (멘토)
     */
    public void complete(Long mentorId){
        validateMentorAuthority(mentorId);
        validateStatusTransition(LessonStatus.IN_PROGRESS, "완료");
        this.status = LessonStatus.COMPLETED;
        this.completedAt = LocalDateTime.now();
    }

    /**
     * 수업 취소 (멘토 or 멘티)
     * MVP 단계에서는 미구현
     *
     * TODO: 확장 단계에서 구현 필요
     *  - GetLessonCancelRequest DTO 생성 (cancelReason, cancelledBy 필드)
     *  - Lessons 테이블 cancelledBy 컬럼 추가
     */
//    public void cancel(String cancelReason, String cancelledBy){}

    /**
     * 상태 전환 검증
     */
    private void validateStatusTransition(LessonStatus expectedStatus, String action) {
        if(this.status != expectedStatus) {
            throw new IllegalStateException(
                    String.format("%s 상태의 수업만 %s할 수 있습니다. (현재: %s)",
                            expectedStatus.getDescription(),
                            action,
                            this.status.getDescription())
            );
        }
    }

    /**
     * 멘토 권한 검증
     */
    private void validateMentorAuthority(Long mentorId) {
        if(!isMentor(mentorId)) {
            throw new IllegalArgumentException("수업을 처리할 권한이 없습니다.");
        }
    }

    // =============== 권한 확인 메서드 =============== //

    /**
     * 멘토 권한 확인
     */
    public boolean isMentor(Long userId){
        return this.tutorial.getMentor().getUser().getId().equals(userId);
    }

    /**
     * 멘티 권한 확인
     */
    public boolean isMentee(Long userId){
        return this.mentee.getId().equals(userId);
    }

    /**
     * 참여자 확인
     */
    public boolean isParticipant(Long userId){
        return isMentee(userId) || isMentor(userId);
    }

    // =============== 상태 확인 메서드 =============== //

    /**
     * 수업이 완료 상태인지 확인
     */
    public boolean isCompleted(){
        return this.status == LessonStatus.COMPLETED;
    }

    /**
     * 수업이 취소 가능한 상태인지 확인
     * MVP 단계에서는 미구현
     */
//    public boolean isCancellable(){return false;}

}
