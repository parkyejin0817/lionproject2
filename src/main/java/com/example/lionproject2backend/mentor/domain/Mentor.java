package com.example.lionproject2backend.mentor.domain;

import com.example.lionproject2backend.global.domain.BaseEntity;
import com.example.lionproject2backend.user.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "mentors")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Mentor extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(columnDefinition = "TEXT")
    private String career;

    @Enumerated(EnumType.STRING)
    private MentorStatus mentorStatus;

    @Column(name = "review_count")
    private int reviewCount = 0;

    public Mentor(User user, String career) {
        this.user = user;
        this.career = career;
        this.mentorStatus = MentorStatus.APPROVED;
        this.reviewCount = 0;
    }
}

