package com.example.lionproject2backend.qna.repository;

import com.example.lionproject2backend.qna.domain.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    //특정 수업 질문 목록 조회
    List<Question> findByLessonId(Long questionId);

    // 멘티의 질문 목록 조회 (자신의 수업에서 작성한 질문)
    @Query("SELECT q FROM Question q WHERE q.lesson.ticket.mentee.id = :userId ORDER BY q.createdAt DESC")
    List<Question> findByMenteeId(@Param("userId") Long userId);

    // 멘토의 질문 목록 조회 (자신의 과외 수업에서 받은 질문)
    @Query("SELECT q FROM Question q WHERE q.lesson.ticket.tutorial.mentor.user.id = :userId ORDER BY q.createdAt DESC")
    List<Question> findByMentorUserId(@Param("userId") Long userId);
}
