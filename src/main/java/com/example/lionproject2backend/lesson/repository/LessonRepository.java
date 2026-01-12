package com.example.lionproject2backend.lesson.repository;

import com.example.lionproject2backend.lesson.domain.Lesson;
import com.example.lionproject2backend.lesson.domain.LessonStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LessonRepository extends JpaRepository<Lesson, Long> {

    /**
     * 멘티가 신청한 수업 목록 (모든 상태 조회)
     * - tutorial, mentor, user, mentee 모두 조회
     * - 생성된 날짜 내림차순
     */
    @Query("select l from Lesson l " +
            "join fetch l.tutorial t " +
            "join fetch t.mentor m " +
            "join fetch m.user u " +
            "where l.mentee.id = :menteeId " +
            "order by l.createdAt desc")
    List<Lesson> findByMenteeIdWithDetails(@Param("menteeId") Long menteeId);

    /**
     * 멘티가 신청한 수업 목록 (상태 필터)
     * - 특정 상태의 수업만 조회
     * - ex) PENDING, APPROVED, COMPLETED
     */
    @Query("select l from Lesson l " +
            "join fetch l.tutorial t " +
            "join fetch t.mentor m " +
            "join fetch m.user u " +
            "where l.mentee.id = :menteeId " +
            "and l.status = :status " +
            "order by l.createdAt desc")
    List<Lesson> findByMenteeIdAndStatusWithDetails(
            @Param("menteeId") Long menteeId,
            @Param("status") LessonStatus status);

    /**
     * 멘토에게 온 수업 신청 목록 (모든 상태 조회)
     * - tutorial, mentee, user
     * - 멘토가 자신의 모든 수업 신청 확인 리스트
     */
    @Query("select l from Lesson l " +
            "join fetch l.tutorial t " +
            "join fetch l.mentee " +
            "where t.mentor.user.id = :userId " +
            "order by l.createdAt desc")
    List<Lesson> findByMentorUserIdWithDetails(@Param("userId") Long userId);

    /**
     * 멘토에게 온 수업 신청 목록 (상태 필터)
     * - 특정 상태의 수업만 조회
     */
    @Query("select l from Lesson l " +
            "join fetch l.tutorial t " +
            "join fetch l.mentee " +
            "where t.mentor.user.id = :userId " +
            "and l.status = :status " +
            "order by l.createdAt desc")
    List<Lesson> findByMentorUserIdAndStatusWithDetails(
            @Param("userId") Long userId,
            @Param("status") LessonStatus status);

    /**
     * 모든 연관 엔티티 fetch join
     * - lesson.isMentor(), lesson.isMentee() 호출 시 N+1문제 해결
     */
    @Query("SELECT l FROM Lesson l " +
            "JOIN FETCH l.tutorial t " +
            "JOIN FETCH t.mentor m " +
            "JOIN FETCH m.user " +
            "JOIN FETCH l.mentee " +
            "WHERE l.id = :lessonId")
    Optional<Lesson> findByIdWithDetails(@Param("lessonId") Long lessonId);
}
