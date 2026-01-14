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
     * 멘토 목록 조회 + 검색
     * GET /api/mentors
     * 검색 조건 X = 최신 등록순
     */

    @GetMapping
    public ResponseEntity<ApiResponse<List<GetMentorListResponse>>> getMentors(
            @ModelAttribute MentorSearchCondition condition) {

        System.out.println("검색 스킬 목록: " + condition.getSkills());

        List<GetMentorListResponse> response = mentorService.searchMentors(condition);
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
}
