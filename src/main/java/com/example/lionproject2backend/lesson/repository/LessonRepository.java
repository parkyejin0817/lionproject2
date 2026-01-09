package com.example.lionproject2backend.lesson.repository;

import com.example.lionproject2backend.lesson.domain.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
}
