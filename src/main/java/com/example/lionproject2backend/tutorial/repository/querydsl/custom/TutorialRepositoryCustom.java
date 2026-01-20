package com.example.lionproject2backend.tutorial.repository.querydsl.custom;

import com.example.lionproject2backend.tutorial.domain.Tutorial;

import java.util.List;

public interface TutorialRepositoryCustom {

    /**
     * 튜토리얼 검색
     * @param skills 기술 스택 목록
     * @param keyword 키워드 검색 (제목, 설명, 스킬 이름)
     * @param minPrice 최소 가격
     * @param maxPrice 최대 가격
     * @param sortBy 정렬 기준
     * @return
     */

    List<Tutorial> searchTutorials(
            List<String> skills,
            String keyword,
            Integer minPrice,
            Integer maxPrice,
            String sortBy
    );
}
