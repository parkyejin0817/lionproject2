package com.example.lionproject2backend.mentor.repository;

import com.example.lionproject2backend.mentor.domain.Mentor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MentorRepository extends JpaRepository<Mentor, Long> {
}
