package com.example.lionproject2backend.admin.service;

import com.example.lionproject2backend.admin.dto.*;
import com.example.lionproject2backend.global.exception.custom.CustomException;
import com.example.lionproject2backend.global.exception.custom.ErrorCode;
import com.example.lionproject2backend.mentor.domain.Mentor;
import com.example.lionproject2backend.mentor.domain.MentorStatus;
import com.example.lionproject2backend.mentor.repository.MentorRepository;
import com.example.lionproject2backend.payment.domain.Payment;
import com.example.lionproject2backend.payment.repository.PaymentRepository;
import com.example.lionproject2backend.user.domain.User;
import com.example.lionproject2backend.user.domain.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 관리자 서비스
 * - 멘토 승인/거절 처리
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

    private final MentorRepository mentorRepository;
    private final PaymentRepository paymentRepository;

    /**
     * 승인 대기 중인 멘토 목록 조회
     * - MentorStatus.PENDING 상태인 멘토만 조회
     */
    public List<GetPendingMentorResponse> getPendingMentors() {
        List<Mentor> pendingMentors = mentorRepository.findByMentorStatus(MentorStatus.PENDING);

        return pendingMentors.stream()
                .map(mentor -> new GetPendingMentorResponse(
                        mentor.getId(),
                        mentor.getUser().getId(),
                        mentor.getUser().getNickname(),
                        mentor.getUser().getEmail(),
                        mentor.getCareer(),
                        mentor.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    /**
     * 멘토 승인
     * 1. 멘토 상태를 APPROVED로 변경
     * 2. 유저 role을 MENTOR로 변경
     */
    @Transactional
    public void approveMentor(Long mentorId) {
        Mentor mentor = mentorRepository.findById(mentorId)
                .orElseThrow(() -> new CustomException(ErrorCode.MENTOR_NOT_FOUND));

        // 멘토 상태 변경 (PENDING → APPROVED)
        mentor.approve();

        // 유저 role 변경 (MENTEE → MENTOR)
        User user = mentor.getUser();
        user.changeRole(UserRole.MENTOR);
    }

    /**
     * 멘토 거절
     * - 멘토 상태를 REJECTED로 변경
     * - 거절 사유 저장
     */
    @Transactional
    public void rejectMentor(Long mentorId, String reason) {
        Mentor mentor = mentorRepository.findById(mentorId)
                .orElseThrow(() -> new CustomException(ErrorCode.MENTOR_NOT_FOUND));

        // 멘토 상태 변경 (PENDING → REJECTED)
        mentor.reject(reason);
    }
}
