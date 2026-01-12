package com.example.lionproject2backend.mentor.domain;

import com.example.lionproject2backend.global.domain.BaseEntity;
import com.example.lionproject2backend.skill.domain.Skill;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "mentor_skills")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MentorSkill extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id")
    private Mentor mentor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id")
    private Skill skill;

    public MentorSkill(Mentor mentor, Skill skill) {
        this.mentor = mentor;
        this.skill = skill;
    }
}

