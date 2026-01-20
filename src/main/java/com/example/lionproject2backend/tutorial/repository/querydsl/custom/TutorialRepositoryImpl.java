package com.example.lionproject2backend.tutorial.repository.querydsl.custom;


import com.example.lionproject2backend.tutorial.domain.Tutorial;
import com.example.lionproject2backend.tutorial.domain.TutorialStatus;
import com.example.lionproject2backend.tutorial.repository.querydsl.expression.TutorialExpression;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

import static com.example.lionproject2backend.tutorial.domain.QTutorial.tutorial;

@Repository
@RequiredArgsConstructor
public class TutorialRepositoryImpl implements TutorialRepositoryCustom {

    private final JPAQueryFactory jpaQueryFactory;

    public List<Tutorial> searchTutorials(
            List<String> skills,
            String keyword,
            Integer minPrice,
            Integer maxPrice,
            String sortBy
    ) {
        return jpaQueryFactory
                .selectFrom(tutorial)
                .distinct()
                .join(tutorial.mentor).fetchJoin()
                .where(
                        TutorialExpression.statusEq(TutorialStatus.ACTIVE),
                        TutorialExpression.keywordContains(keyword),
                        TutorialExpression.skillIn(skills),
                        TutorialExpression.priceBetween(minPrice, maxPrice)
                )
                .orderBy(getOrderSpecifier(sortBy))
                .fetch();
    }

    /**
     * 정렬 조건 생성
     * rating, reviewCount는 Service에서 메모리 정렬
     */
    private OrderSpecifier<?> getOrderSpecifier(String sortBy) {
        if (sortBy == null) {
            return tutorial.createdAt.desc();
        }

        return switch (sortBy) {
            case "priceAsc" -> tutorial.price.asc();
            case "priceDesc" -> tutorial.price.desc();
            // rating, reviewCount는 Service에서 처리
            default -> tutorial.createdAt.desc();
        };
    }
}

