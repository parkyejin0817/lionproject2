package com.example.lionproject2backend.qna.repository;

import com.example.lionproject2backend.auth.domain.RefreshTokenStorage;
import com.example.lionproject2backend.qna.domain.Question;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionRepository extends JpaRepository<Question, Long> {
}
