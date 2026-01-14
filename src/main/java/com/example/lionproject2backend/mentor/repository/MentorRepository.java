package com.example.lionproject2backend.mentor.repository;

import com.example.lionproject2backend.mentor.domain.Mentor;
import com.example.lionproject2backend.mentor.domain.MentorStatus;
import com.example.lionproject2backend.mentor.repository.querydsl.custom.MentorRepositoryCustom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MentorRepository extends JpaRepository<Mentor, Long>, MentorRepositoryCustom {
    Optional<Mentor> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
    List<Mentor> findByMentorStatus(MentorStatus status);
}
