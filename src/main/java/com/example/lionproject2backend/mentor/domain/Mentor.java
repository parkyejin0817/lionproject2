package com.example.lionproject2backend.mentor.domain;

import com.example.lionproject2backend.global.domain.BaseEntity;
import com.example.lionproject2backend.tutorial.domain.Tutorial;
import com.example.lionproject2backend.user.domain.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

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
    @Column(name = "status")
    private MentorStatus mentorStatus;

    @Column(name = "review_count")
    private int reviewCount = 0;

    @OneToMany(mappedBy = "mentor", fetch = FetchType.LAZY)
    private List<MentorSkill> mentorSkills = new ArrayList<>();

    @OneToMany(mappedBy = "mentor", fetch = FetchType.LAZY)
    private List<Tutorial> tutorials = new ArrayList<>();

    @OneToMany(mappedBy = "mentor", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MentorAvailability> availabilities = new ArrayList<>();

    public Mentor(User user, String career) {
        this.user = user;
        this.career = career;
        this.mentorStatus = MentorStatus.PENDING;
        this.reviewCount = 0;
    }


    // 멘토 승인
    public void approve() {
        this.mentorStatus = MentorStatus.APPROVED;
    }

    // 멘토 거절
    public void reject(String reason) {
        this.mentorStatus = MentorStatus.REJECTED;
    }
    // =============== 가용 시간 관련 메서드 =============== //

    /**
     * 가용 시간 추가
     */
    public void addAvailability(MentorAvailability availability) {
        this.availabilities.add(availability);
    }

    /**
     * 특정 요일/시간이 가용한지 확인
     */
    public boolean isAvailable(DayOfWeek dayOfWeek, LocalTime time) {
        return availabilities.stream()
                .filter(MentorAvailability::isActive)
                .filter(a -> a.getDayOfWeek().matches(dayOfWeek))
                .anyMatch(a -> a.isTimeWithinRange(time));
    }

    /**
     * 특정 요일/시간이 가용한지 확인 (duration 고려)
     */
    public boolean isAvailable(DayOfWeek dayOfWeek, LocalTime time, int durationMinutes) {
        return availabilities.stream()
                .filter(MentorAvailability::isActive)
                .filter(a -> a.getDayOfWeek().matches(dayOfWeek))
                .anyMatch(a -> a.isTimeWithinRange(time, durationMinutes));
    }
}

