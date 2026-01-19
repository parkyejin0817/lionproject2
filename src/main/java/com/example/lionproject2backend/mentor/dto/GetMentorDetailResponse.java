package com.example.lionproject2backend.mentor.dto;

import com.example.lionproject2backend.mentor.domain.Mentor;
import com.example.lionproject2backend.review.domain.Review;
import com.example.lionproject2backend.tutorial.domain.Tutorial;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 멘토 상세 조회
 */

@Getter
@AllArgsConstructor
public class GetMentorDetailResponse {

    private Long mentorId;
    private String nickname;
    private String career;
    private Integer reviewCount;
    private Double averageRating;
    private List<String> skills;
    private List<TutorialInfo> tutorials;
    private List<ReviewInfo> reviews;
    private LocalDateTime createdAt;

    public static GetMentorDetailResponse from(
            Mentor mentor,
            List<String> skills,
            List<Tutorial> tutorials,
            List<Review> reviews
    ) {
        List<TutorialInfo> tutorialInfos = tutorials.stream()
                .map(tutorial -> TutorialInfo.from(tutorial, reviews))
                .toList();

        List<ReviewInfo> reviewInfos = reviews.stream()
                .map(ReviewInfo::from)
                .toList();

        double avgRating = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
        avgRating = Math.round(avgRating * 10) / 10.0;

        return new GetMentorDetailResponse(
                mentor.getId(),
                mentor.getUser().getNickname(),
                mentor.getCareer(),
                reviews.size(),
                avgRating,
                skills,
                tutorialInfos,
                reviewInfos,
                mentor.getCreatedAt()
        );
    }

    @Getter
    @AllArgsConstructor
    public static class TutorialInfo {
        private Long id;
        private String title;
        private String description;
        private Integer price;
        private Integer duration;
        private Double rating;
        private Integer reviewCount;
        private String status;
        private List<SkillInfo> skills;

        // reviews를 받아서 해당 튜토리얼의 평점/리뷰수 계산
        public static TutorialInfo from(Tutorial tutorial, List<Review> allReviews) {
            List<SkillInfo> skillInfos = tutorial.getTutorialSkills().stream()
                    .map(ts -> new SkillInfo(ts.getSkill().getId(), ts.getSkill().getSkillName()))
                    .toList();

            // 해당 튜토리얼의 리뷰만 필터링
            List<Review> tutorialReviews = allReviews.stream()
                    .filter(r -> r.getTutorial().getId().equals(tutorial.getId()))
                    .toList();

            // 평균 평점 계산
            double averageRating = tutorialReviews.stream()
                    .mapToInt(Review::getRating)
                    .average()
                    .orElse(0.0);
            averageRating = Math.round(averageRating * 10) / 10.0;

            return new TutorialInfo(
                    tutorial.getId(),
                    tutorial.getTitle(),
                    tutorial.getDescription(),
                    tutorial.getPrice(),
                    tutorial.getDuration(),
                    averageRating,
                    tutorialReviews.size(),
                    tutorial.getTutorialStatus().name(),
                    skillInfos
            );
        }
    }

    @Getter
    @AllArgsConstructor
    public static class SkillInfo {
        private Long id;
        private String skillName;
    }

    @Getter
    @AllArgsConstructor
    public static class ReviewInfo {
        private Long id;
        private Integer rating;
        private String content;
        private MenteeInfo mentee;
        private LocalDateTime createdAt;

        public static ReviewInfo from(Review review) {
            return new ReviewInfo(
                    review.getId(),
                    review.getRating(),
                    review.getContent(),
                    new MenteeInfo(review.getMentee().getId(), review.getMentee().getNickname()),
                    review.getCreatedAt()
            );
        }
    }

    @Getter
    @AllArgsConstructor
    public static class MenteeInfo {
        private Long id;
        private String nickname;
    }
}
