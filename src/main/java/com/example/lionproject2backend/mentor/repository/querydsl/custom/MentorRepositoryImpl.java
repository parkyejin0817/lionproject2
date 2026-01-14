package com.example.lionproject2backend.mentor.repository.querydsl.custom;

import com.example.lionproject2backend.mentor.domain.Mentor;
import com.example.lionproject2backend.mentor.domain.MentorStatus;
import com.example.lionproject2backend.mentor.dto.MentorSearchCondition;
import com.example.lionproject2backend.mentor.repository.querydsl.expression.MentorExpression;
import com.example.lionproject2backend.tutorial.domain.Tutorial;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.Comparator;
import java.util.List;

import static com.example.lionproject2backend.mentor.domain.QMentor.mentor;
import static com.example.lionproject2backend.user.domain.QUser.user;


@RequiredArgsConstructor
public class MentorRepositoryImpl implements MentorRepositoryCustom {

    private final JPAQueryFactory jpaQueryFactory;
    public List<Mentor> searchMentors(MentorSearchCondition condition) {
        // 쿼리 실행 후 리스트 불러오기
        List<Mentor> mentors = jpaQueryFactory
                .selectFrom(mentor)
                .distinct() // 1:N 관계 조인 시 중복 데이터 방지
                .join(mentor.user, user).fetchJoin() // 페치 조인
                .where(
                        MentorExpression.statusEq(MentorStatus.APPROVED),
                        MentorExpression.nicknameContains(condition.getNickname()),
                        MentorExpression.skillIn(condition.getSkills()), // AND 필터 적용
                        MentorExpression.priceBetween(condition.getMinPrice(), condition.getMaxPrice())
                )
                .orderBy(isPriceSorting(condition.getSortBy()) ? mentor.id.desc() : mentor.sort(condition))
                .fetch();

        // 2. 가격 정렬
        if ("priceAsc".equals(condition.getSortBy())) {
            return mentors.stream()
                    .sorted(Comparator.comparing(this::getMinPrice))
                    .toList();
        } else if ("priceDesc".equals(condition.getSortBy())) {
            return mentors.stream()
                    .sorted(Comparator.comparing(this::getMinPrice).reversed())
                    .toList();
        }

        return mentors;
    }

    private boolean isPriceSorting(String sortBy) {
        return "priceAsc".equals(sortBy) || "priceDesc".equals(sortBy);
    }

    private int getMinPrice(Mentor mentor) {
        return mentor.getTutorials().stream()
                .mapToInt(Tutorial::getPrice)
                .min()
                .orElse(Integer.MAX_VALUE);
    }
}
