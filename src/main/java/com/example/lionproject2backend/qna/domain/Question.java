package com.example.lionproject2backend.qna.domain;

import com.example.lionproject2backend.global.domain.BaseEntity;
import com.example.lionproject2backend.lesson.domain.Lesson;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "questions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Question extends BaseEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 하나의 수업에 여러개의 질문 가능
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id")
    private Lesson lesson;

    @Column(length = 200, nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "code_content", columnDefinition = "TEXT")
    private String codeContent;

    @OneToMany(mappedBy = "question")
    private List<Answer> answers = new ArrayList<>();

    /**
     * 질문 생성
     */
    public static Question create(Lesson lesson, String title, String content, String codeContent) {
        Question question = new Question();
        question.lesson = lesson;
        question.title = title;
        question.content = content;
        question.codeContent = codeContent;
        return question;
    }

}
