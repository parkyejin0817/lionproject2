package com.example.lionproject2backend.tutorial.repository.querydsl.expression;

import com.example.lionproject2backend.skill.domain.QSkill;
import com.example.lionproject2backend.tutorial.domain.QTutorialSkill;
import com.example.lionproject2backend.tutorial.domain.TutorialStatus;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.JPAExpressions;
import org.springframework.util.StringUtils;

import java.util.List;

import static com.example.lionproject2backend.tutorial.domain.QTutorial.tutorial;

/**
 * Tutorial QueryDSL BooleanExpression
 * 검색 조건을 BooleanExpression으로 변환
 */

public class TutorialExpression {

    /**
     * 활성 상태 튜토리얼만 필터링
     */
    public static BooleanExpression statusEq(TutorialStatus status) {
        return status != null ? tutorial.tutorialStatus.eq(status) : null;
    }

    /**
     * 제목 부분 일치 검색 (대소문자 무시)
     */
    public static BooleanExpression titleContains(String title) {
        return StringUtils.hasText(title)
                ? tutorial.title.containsIgnoreCase(title)
                : null;
    }

    /**
     * 키워드 검색 (제목, 설명, 스킬 이름에서 OR 검색)
     */
    public static BooleanExpression keywordContains(String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return null;
        }

        QTutorialSkill subTutorialSkill = new QTutorialSkill("keywordTutorialSkill");
        QSkill subSkill = new QSkill("keywordSkill");

        // 제목 또는 설명에 키워드 포함
        BooleanExpression titleMatch = tutorial.title.containsIgnoreCase(keyword);
        BooleanExpression descMatch = tutorial.description.containsIgnoreCase(keyword);

        // 스킬 이름에 키워드 포함하는 튜토리얼 (서브쿼리)
        BooleanExpression skillMatch = tutorial.id.in(
                JPAExpressions
                        .select(subTutorialSkill.tutorial.id)
                        .from(subTutorialSkill)
                        .join(subTutorialSkill.skill, subSkill)
                        .where(subSkill.skillName.containsIgnoreCase(keyword))
        );

        return titleMatch.or(descMatch).or(skillMatch);
    }

    /**
     * 기술 스택 필터링 (AND 조건)
     * 요청한 모든 기술을 보유한 튜토리얼만 조회
     */
    public static BooleanExpression skillIn(List<String> skills) {
        if (skills == null || skills.isEmpty()) {
            return null;
        }

        QTutorialSkill subTutorialSkill = new QTutorialSkill("subTutorialSkill");
        QSkill subSkill = new QSkill("subSkill");

        // 서브쿼리로 모든 스킬을 가진 튜토리얼만 조회
        return tutorial.id.in(
                JPAExpressions
                        .select(subTutorialSkill.tutorial.id)
                        .from(subTutorialSkill)
                        .join(subTutorialSkill.skill, subSkill)
                        .where(subSkill.skillName.lower().in(
                                skills.stream()
                                        .map(String::toLowerCase)
                                        .toList()
                        ))
                        .groupBy(subTutorialSkill.tutorial.id)
                        .having(subSkill.skillName.countDistinct().eq((long) skills.size()))
        );
    }

    /**
     * 가격 범위 필터링
     */
    public static BooleanExpression priceBetween(Integer minPrice, Integer maxPrice) {
        if (minPrice == null && maxPrice == null) return null;

        if (minPrice != null && maxPrice != null) {
            return tutorial.price.between(minPrice, maxPrice);
        } else if (minPrice != null) {
            return tutorial.price.goe(minPrice);
        } else {
            return tutorial.price.loe(maxPrice);
        }
    }
}

