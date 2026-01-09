package com.example.lionproject2backend.tutorial.repository;

import com.example.lionproject2backend.auth.domain.RefreshTokenStorage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TutorialSkillRepository extends JpaRepository<RefreshTokenStorage, Long> {
}
