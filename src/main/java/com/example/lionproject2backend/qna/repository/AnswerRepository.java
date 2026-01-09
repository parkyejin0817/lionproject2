package com.example.lionproject2backend.qna.repository;

import com.example.lionproject2backend.auth.domain.RefreshTokenStorage;
import com.example.lionproject2backend.qna.domain.Answer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnswerRepository extends JpaRepository<Answer, Long> {
}
