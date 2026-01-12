package com.example.lionproject2backend.lesson.service;

import com.example.lionproject2backend.lesson.dto.*;
import com.example.lionproject2backend.lesson.domain.Lesson;
import com.example.lionproject2backend.lesson.domain.LessonStatus;
import com.example.lionproject2backend.lesson.repository.LessonRepository;
import com.example.lionproject2backend.tutorial.domain.Tutorial;
import com.example.lionproject2backend.tutorial.repository.TutorialRepository;
import com.example.lionproject2backend.user.domain.User;
import com.example.lionproject2backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class LessonServiceImpl implements LessonService {

    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;
    private final TutorialRepository tutorialRepository;

    /**
     * 수업 신청
     * Post /api/tutorials/{tutorialId}/lessons
     */
    @Override
    @Transactional
    public PostLessonRegisterResponse register(Long tutorialId, Long userId, PostLessonRegisterRequest request) {
        // Tutorial 조회
        Tutorial tutorial = tutorialRepository.findById(tutorialId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않은 과외입니다."));

        // Mentee 조회
        User mentee = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        //Lesson 생성
        Lesson lesson = Lesson.register(
                tutorial,
                mentee,
                request.getRequestMessage(),
                LocalDateTime.of(request.getLessonDate(), request.getLessonTime())
        );

        Lesson savedLesson = lessonRepository.save(lesson);

        return PostLessonRegisterResponse.from(savedLesson);
    }

    /**
     * 내가 신청한 수업 목록 조회
     * Get /api/lessons/my?status=PENDING
     */
    @Override
    public GetLessonListResponse getMyLessons(Long menteeId, LessonStatus status) {
        List<Lesson> lessons;

        if (status == null) {
            lessons = lessonRepository.findByMenteeIdWithDetails(menteeId);
        }else{
            lessons = lessonRepository.findByMenteeIdAndStatusWithDetails(menteeId, status);
        }

        return GetLessonListResponse.from(lessons);
    }

    /**
     * 수업 신청 목록 조회 (멘토)
     * Get /api/lessons/requests(?status=PENDING)
     */
    @Override
    public GetLessonRequestListResponse getMyLessonRequests(Long mentorId, LessonStatus status) {
        List<Lesson> lessons;

        if(status == null) {
            lessons = lessonRepository.findByMentorUserIdWithDetails(mentorId);
        }else{
            lessons = lessonRepository.findByMentorUserIdAndStatusWithDetails(mentorId, status);
        }

        return GetLessonRequestListResponse.from(lessons);
    }

    /**
     * 수업 상세 조회
     * Get /api/lessons/{lessonId}
     */
    @Override
    public GetLessonDetailResponse getLessonDetail(Long lessonId, Long userId) {
        Lesson lesson = lessonRepository.findByIdWithDetails(lessonId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 수업입니다."));

        // 권한 확인
        if(!lesson.isParticipant(userId)) {
            throw new IllegalArgumentException("해당 수업을 조회할 권한이 없습니다.");
        }

        return GetLessonDetailResponse.from(lesson, userId);
    }

    /**
     * 수업 승인 (멘토)
     * PUT /api/lessons/{lessonId}/approve
     */
    @Override
    @Transactional
    public PutLessonStatusUpdateResponse approve(Long lessonId, Long mentorId) {
        Lesson lesson = lessonRepository.findByIdWithDetails(lessonId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 수업입니다."));

        // 도메인 로직 실행(상태: PENDING -> APPROVED)
        lesson.approve(mentorId);

        return PutLessonStatusUpdateResponse.from(lesson);
    }

    /**
     * 수업 거절 (멘토)
     * PUT /api/lessons/{lessonId}/reject
     */
    @Override
    @Transactional
    public PutLessonStatusUpdateResponse reject(Long lessonId, Long mentorId, PutLessonRejectRequest request) {
        Lesson lesson = lessonRepository.findByIdWithDetails(lessonId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 수업입니다."));

        // 도메인 로직 실행(상태: PENDING -> REJECTED)
        lesson.reject(mentorId, request.getRejectReason());

        return PutLessonStatusUpdateResponse.from(lesson);
    }

    /**
     * 수업 시작 (멘토)
     * PUT /api/lessons/{lessonId}/start
     */
    @Override
    @Transactional
    public PutLessonStatusUpdateResponse start(Long lessonId, Long mentorId) {
        Lesson lesson = lessonRepository.findByIdWithDetails(lessonId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 수업입니다."));

        // 도메인 로직 실행(멘토 검증, 상태: APPROVED -> IN_PROGRESS)
        lesson.start(mentorId);

        return PutLessonStatusUpdateResponse.from(lesson);
    }

    /**
     * 수업 완료 (멘토)
     * PUT /api/lessons/{lessonId}/complete
     */
    @Override
    @Transactional
    public PutLessonStatusUpdateResponse complete(Long lessonId, Long mentorId) {
        Lesson lesson = lessonRepository.findByIdWithDetails(lessonId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 수업입니다."));

        // 도메인 로직 실행(상태: IN_PROGRESS -> COMPLETED)
        lesson.complete(mentorId);

        return PutLessonStatusUpdateResponse.from(lesson);
    }
}
