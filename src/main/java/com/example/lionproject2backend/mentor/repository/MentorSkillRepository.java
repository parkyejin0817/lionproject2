package com.example.lionproject2backend.mentor.repository;

import com.example.lionproject2backend.mentor.domain.MentorSkill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MentorSkillRepository extends JpaRepository<MentorSkill, Long> {
    List<MentorSkill> findByMentorId(Long mentorId);
    void deleteByMentorId(Long mentorId);
}
