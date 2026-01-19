package com.example.lionproject2backend.mentor.controller;

import com.example.lionproject2backend.global.response.ApiResponse;
import com.example.lionproject2backend.mentor.dto.*;
import com.example.lionproject2backend.mentor.service.MentorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mentors")
@RequiredArgsConstructor
public class MentorController {
    private final MentorService mentorService;

    /**
     * 멘토 신청
     * POST /api/mentors/apply
     */

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<PostMentorApplyResponse>> applyMentor(
            @AuthenticationPrincipal Long userId, @RequestBody @Valid PostMentorApplyRequest request){

        PostMentorApplyResponse response = mentorService.postMentor(userId, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    /**
     * 멘토 목록 조회 (전체)
     * GET /api/mentors
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<GetMentorListResponse>>> getMentors() {
        List<GetMentorListResponse> response = mentorService.getAllMentors();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 멘토 상세 조회
     */
    @GetMapping("/{mentorId}")
    public ResponseEntity<ApiResponse<GetMentorDetailResponse>> getMentor(@PathVariable Long mentorId){
        GetMentorDetailResponse response = mentorService.getMentor(mentorId);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 현재 로그인한 멘토의 프로필 조회
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<GetMentorDetailResponse>> getMyMentorProfile(
            @AuthenticationPrincipal Long userId) {
        GetMentorDetailResponse response = mentorService.getMentorByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
