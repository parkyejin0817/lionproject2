package com.example.lionproject2backend.mentor.service;

import com.example.lionproject2backend.global.exception.custom.CustomException;
import com.example.lionproject2backend.global.exception.custom.ErrorCode;
import com.example.lionproject2backend.mentor.domain.Mentor;
import com.example.lionproject2backend.mentor.domain.MentorSkill;
import com.example.lionproject2backend.mentor.dto.*;
import com.example.lionproject2backend.mentor.repository.MentorRepository;
import com.example.lionproject2backend.mentor.repository.MentorSkillRepository;
import com.example.lionproject2backend.review.domain.Review;
import com.example.lionproject2backend.review.repository.ReviewRepository;
import com.example.lionproject2backend.skill.domain.Skill;
import com.example.lionproject2backend.skill.repository.SkillRepository;
import com.example.lionproject2backend.tutorial.domain.Tutorial;
import com.example.lionproject2backend.tutorial.repository.TutorialRepository;
import com.example.lionproject2backend.user.domain.User;
import com.example.lionproject2backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MentorService {

    private final MentorRepository mentorRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final MentorSkillRepository mentorSkillRepository;
    private final TutorialRepository tutorialRepository;
    private final ReviewRepository reviewRepository;

    /**
     * 멘토 신청 (자동 승인 상태)
     * 스킬 정보도 함께 저장
     */
    @Transactional
    public PostMentorApplyResponse postMentor(Long userId, PostMentorApplyRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (mentorRepository.existsByUserId(userId)) {
            throw new CustomException(ErrorCode.ALREADY_MENTOR);
        }

        // 멘토 생성 (APPROVED)
        Mentor mentor = new Mentor(user, request.getCareer());
        Mentor savedMentor = mentorRepository.save(mentor);

        // 사용자 역할을 MENTOR로 변경
        user.promoteToMentor();

        // 스킬 등록 (없으면 생성/있으면 재사용)
        for (String skillName : request.getSkills()) {
            Skill skill = skillRepository.findBySkillName(skillName)
                    .orElseGet(() -> skillRepository.save(new Skill(skillName)));

            MentorSkill mentorSkill = new MentorSkill(savedMentor, skill);
            mentorSkillRepository.save(mentorSkill);
        }

        return new PostMentorApplyResponse(savedMentor.getId(), "APPROVED");
    }

    /**
     * 멘토 전체 조회
     */
    public List<GetMentorListResponse> getAllMentors() {
        List<Mentor> mentors = mentorRepository.findAll();

        return mentors.stream()
                .map(mentor -> {
                    // 1. 스킬 목록 추출
                    List<String> skills = mentor.getMentorSkills().stream()
                            .map(ms -> ms.getSkill().getSkillName())
                            .toList();

                    // 2. 리뷰 목록 조회
                    List<Review> reviews = reviewRepository.findByMentorId(mentor.getId());

                    // 3. 리뷰 개수
                    int reviewCount = reviews.size();

                    // 4. 평균 평점 계산 (리뷰 없으면 0.0)
                    double averageRating = Math.round(
                            reviews.stream()
                                    .mapToInt(Review::getRating)
                                    .average()
                                    .orElse(0.0) * 10
                    ) / 10.0;

                    return new GetMentorListResponse(
                            mentor.getId(),
                            mentor.getUser().getNickname(),
                            mentor.getCareer(),
                            reviewCount,
                            skills,
                            averageRating
                    );
                })
                .toList();
    }

    /**
     * 멘토 상세 조회
     */

    public GetMentorDetailResponse getMentor(Long mentorId) {

        Mentor mentor = mentorRepository.findById(mentorId)
                .orElseThrow(() -> new CustomException(ErrorCode.MENTOR_NOT_FOUND));

        List<String> skills = mentorSkillRepository.findByMentorId(mentorId)
                .stream()
                .map(ms -> ms.getSkill().getSkillName())
                .toList();

        List<Tutorial> tutorials = tutorialRepository.findByMentorId(mentorId);

        // 튜토리얼 ID 목록으로 리뷰 조회
        List<Long> tutorialIds = tutorials.stream()
                .map(Tutorial::getId)
                .toList();

        List<Review> reviews = tutorialIds.isEmpty()
                ? List.of()
                : reviewRepository.findByTutorialIdInWithTutorial(tutorialIds);
        return GetMentorDetailResponse.from(mentor, skills, tutorials, reviews);
    }

    /**
     * 현재 로그인한 사용자의 멘토 프로필 조회
     */
    public GetMentorDetailResponse getMentorByUserId(Long userId) {
        Mentor mentor = mentorRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.MENTOR_NOT_FOUND));

        return getMentor(mentor.getId());
    }

}
