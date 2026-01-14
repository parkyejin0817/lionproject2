package com.example.lionproject2backend.mentor.service;

import com.example.lionproject2backend.mentor.domain.Mentor;
import com.example.lionproject2backend.mentor.domain.MentorSkill;
import com.example.lionproject2backend.mentor.dto.*;
import com.example.lionproject2backend.mentor.repository.MentorRepository;
import com.example.lionproject2backend.mentor.repository.MentorSkillRepository;
import com.example.lionproject2backend.skill.domain.Skill;
import com.example.lionproject2backend.skill.repository.SkillRepository;
import com.example.lionproject2backend.tutorial.domain.Tutorial;
import com.example.lionproject2backend.user.domain.User;
import com.example.lionproject2backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MentorService {

    private final MentorRepository mentorRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final MentorSkillRepository mentorSkillRepository;

    /**
     * 멘토 신청 (자동 승인 상태)
     * 스킬 정보도 함께 저장
     */
    @Transactional
    public PostMentorApplyResponse postMentor(Long userId, PostMentorApplyRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (mentorRepository.existsByUserId(userId)) {
            throw new IllegalArgumentException("이미 멘토로 등록되어 있습니다.");
        }

        // 멘토 생성 (APPROVED)
        Mentor mentor = new Mentor(user, request.getCareer());
        Mentor savedMentor = mentorRepository.save(mentor);

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
     * 멘토 상세 조회
     */
    public GetMentorDetailResponse getMentor(Long mentorId) {
        Mentor mentor = mentorRepository.findById(mentorId)
                .orElseThrow(() -> new IllegalArgumentException("멘토를 찾을 수 없습니다."));

        List<String> skills = mentorSkillRepository.findByMentorId(mentorId)
                .stream()
                .map(ms -> ms.getSkill().getSkillName())
                .collect(Collectors.toList());

        return new GetMentorDetailResponse(
                mentor.getId(),
                mentor.getUser().getNickname(),
                mentor.getCareer(),
                mentor.getReviewCount(),
                skills
        );
    }

    /**
     * 멘토 검색 및 전체 조회
     * 조건이 없으면 전체 조회
     */
    public List<GetMentorListResponse> searchMentors(MentorSearchCondition condition) {
        List<Mentor> mentors = mentorRepository.searchMentors(condition);
        return convertToResponse(mentors);
    }

    /**
     * 멘토 리스트를 GetMentorListResponse DTO로 변환
     */
    private List<GetMentorListResponse> convertToResponse(List<Mentor> mentors) {
        return mentors.stream()
                .map(mentor -> {
                    // 1. 스킬 목록 추출
                    List<String> skills = mentor.getMentorSkills().stream()
                            .map(ms -> ms.getSkill().getSkillName())
                            .collect(Collectors.toList());

                    // 2. 멘토가 가진 튜토리얼 중 최저 가격 계산 (메서드 참조 사용)
                    int minPrice = mentor.getTutorials().stream()
                            .mapToInt(Tutorial::getPrice)
                            .min()
                            .orElse(0);

                    // 3. 6개의 인자를 사용하여 DTO 생성
                    return new GetMentorListResponse(
                            mentor.getId(),
                            mentor.getUser().getNickname(),
                            mentor.getCareer(),
                            mentor.getReviewCount(),
                            skills,
                            minPrice
                    );
                })
                .collect(Collectors.toList());
    }
}
