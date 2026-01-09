package com.example.lionproject2backend.skill.repository;

import com.example.lionproject2backend.skill.domain.Skill;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SkillRepository extends JpaRepository<Skill, Long> {
}
