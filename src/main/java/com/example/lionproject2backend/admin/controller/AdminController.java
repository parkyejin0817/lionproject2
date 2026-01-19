package com.example.lionproject2backend.admin.controller;

import com.example.lionproject2backend.admin.dto.*;
import com.example.lionproject2backend.admin.service.AdminService;
import com.example.lionproject2backend.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 관리자 API 컨트롤러
 * - 멘토 승인/거절
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    /**
     * 승인 대기 중인 멘토 목록 조회
     * GET /api/admin/mentors/pending
     */
    @GetMapping("/mentors/pending")
    public ResponseEntity<ApiResponse<List<GetPendingMentorResponse>>> getPendingMentors() {
        List<GetPendingMentorResponse> response = adminService.getPendingMentors();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 멘토 승인
     * PUT /api/admin/mentors/{mentorId}/approve
     */
    @PutMapping("/mentors/{mentorId}/approve")
    public ResponseEntity<ApiResponse<Void>> approveMentor(@PathVariable Long mentorId) {
        adminService.approveMentor(mentorId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * 멘토 거절
     * PUT /api/admin/mentors/{mentorId}/reject
     */
    @PutMapping("/mentors/{mentorId}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectMentor(
            @PathVariable Long mentorId,
            @RequestBody PutRejectRequest request) {
        adminService.rejectMentor(mentorId, request.getReason());
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
