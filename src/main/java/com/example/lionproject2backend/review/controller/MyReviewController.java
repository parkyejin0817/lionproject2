package com.example.lionproject2backend.review.controller;

import com.example.lionproject2backend.global.response.ApiResponse;
import com.example.lionproject2backend.review.dto.GetReviewDetailResponse;
import com.example.lionproject2backend.review.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reviews")
public class MyReviewController {

    private final ReviewService reviewService;

    /**
     * 내가 작성한 모든 리뷰 조회
     * GET /api/reviews/my
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<GetReviewDetailResponse>>> getMyAllReviews(
            @AuthenticationPrincipal Long userId
    ) {
        List<GetReviewDetailResponse> reviews = reviewService.getMyAllReviews(userId);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }
}
