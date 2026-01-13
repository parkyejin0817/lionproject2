package com.example.lionproject2backend.review.dto;

import com.example.lionproject2backend.review.domain.Review;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class GetReviewDetailResponse {
    private Long id;
    private int rating;
    private String content;
    private LocalDateTime createdAt;

    public static GetReviewDetailResponse from(Review review) {
        return GetReviewDetailResponse.builder()
                .id(review.getId())
                .rating(review.getRating())
                .content(review.getContent())
                .createdAt(review.getCreatedAt())
                .build();
    }
}