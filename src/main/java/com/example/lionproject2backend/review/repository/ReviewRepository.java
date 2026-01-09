package com.example.lionproject2backend.review.repository;

import com.example.lionproject2backend.auth.domain.RefreshTokenStorage;
import com.example.lionproject2backend.review.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {
}
