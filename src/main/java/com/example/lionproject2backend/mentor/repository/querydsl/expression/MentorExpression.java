package com.example.lionproject2backend.mentor.repository.querydsl.expression;

import com.example.lionproject2backend.mentor.domain.MentorStatus;
import com.example.lionproject2backend.mentor.domain.QMentor;
import com.example.lionproject2backend.mentor.dto.MentorSearchCondition;
import com.querydsl.core.annotations.QueryDelegate;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.core.types.dsl.BooleanExpression;
import org.springframework.util.StringUtils;

import java.util.List;

import static com.example.lionproject2backend.mentor.domain.QMentor.mentor;


/**
 * - @QueryDelegate로 QMentor 클래스에 메서드 자동 생성
 * - 검색 조건과 정렬을 Q클래스에서 직접 사용 가능
 */

public class MentorExpression {

    /**
     * 승인된 멘토 필터링
     */

    public static BooleanExpression statusEq(MentorStatus status) {
        return status != null ? mentor.mentorStatus.eq(status) : null;
    }

    /**
     * 닉네임 부분 일치 검색 (대소문자 무시)
     */

    public static BooleanExpression nicknameContains(String nickname) {
        return StringUtils.hasText(nickname)
                ? mentor.user.nickname.containsIgnoreCase(nickname)
                : null;
    }

    /**
     * 기술 스택 필터링
     * And 조건
     * 요청한 모든 기술을 보유한 멘토만 조회
     */

    public static BooleanExpression skillIn(List<String> skills) {
        if (skills == null || skills.isEmpty()) {
            return null;
        }

        // 모든 스킬 조건을 AND로 결합
        BooleanExpression expression = null;

        for (String skillName : skills) {
            // 멘토가 가진 스킬들 중에 현재 skillName이 하나라도 있는지 확인하는 조건
            BooleanExpression hasSkill = mentor.mentorSkills.any().skill.skillName.eq(skillName);

            if (expression == null) {
                expression = hasSkill;
            } else {
                // AND로 결합하여 모든 스킬을 가진 사람만 남김
                expression = expression.and(hasSkill);
            }
        }

        return expression;
    }

    /**
     * 가격 범위 필터링
     */

    public static BooleanExpression priceBetween(Integer minPrice, Integer maxPrice) {
        if (minPrice == null && maxPrice == null) return null;

        int min = minPrice != null ? minPrice : 0;
        int max = maxPrice != null ? maxPrice : Integer.MAX_VALUE;

        return mentor.tutorials.any().price.between(min, max);
    }

    /**
     * 정렬 조건 생성 (@QueryDelegate)
     * - reviewCount: 리뷰 많은 순
     * - 기본: 최신 등록순
     * - 가격 정렬은 메모리에서 처리
     */
    @QueryDelegate(com.example.lionproject2backend.mentor.domain.Mentor.class)
    public static OrderSpecifier<?> sort(QMentor mentor, MentorSearchCondition condition) {
        String sortBy = condition.getSortBy();

        if ("reviewCount".equals(sortBy)) {
            return mentor.reviewCount.desc();
        }

        return mentor.createdAt.desc();
    }
}
