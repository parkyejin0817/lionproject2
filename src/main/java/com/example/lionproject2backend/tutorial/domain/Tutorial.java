package com.example.lionproject2backend.tutorial.domain;

import com.example.lionproject2backend.global.domain.BaseEntity;
import com.example.lionproject2backend.mentor.domain.Mentor;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tutorials")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Tutorial extends BaseEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id")
    private Mentor mentor;

    @Column(length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private int price;
    private int duration;

    @Enumerated(EnumType.STRING)
    private TutorialStatus tutorialStatus;


    @Column(precision = 3, scale = 2)
    private BigDecimal rating;

    @Column(length = 20)
    private String status = "ACTIVE";
}

