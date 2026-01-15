package com.example.lionproject2backend.lesson.dto;

import com.example.lionproject2backend.lesson.domain.Lesson;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * GET /api/tutorials/{tutorialId}/calendar - 달력 예약 현황
 */
@Getter
@Builder(access = AccessLevel.PRIVATE)
public class GetCalendarLessonsResponse {

    private List<CalendarDay> days;

    public static GetCalendarLessonsResponse from(List<Lesson> lessons) {
        // 날짜별로 그룹핑
        Map<LocalDate, List<Lesson>> lessonsByDate = lessons.stream()
                .collect(Collectors.groupingBy(
                        lesson -> lesson.getScheduledAt().toLocalDate()
                ));

        List<CalendarDay> dayList = lessonsByDate.entrySet().stream()
                .map(entry -> CalendarDay.from(entry.getKey(), entry.getValue()))
                .sorted((a, b) -> a.getDate().compareTo(b.getDate()))
                .collect(Collectors.toList());

        return GetCalendarLessonsResponse.builder()
                .days(dayList)
                .build();
    }

    @Getter
    @Builder(access = AccessLevel.PRIVATE)
    public static class CalendarDay {
        private LocalDate date;
        private int lessonCount;
        private List<TimeSlot> slots;

        public static CalendarDay from(LocalDate date, List<Lesson> lessons) {
            List<TimeSlot> timeSlots = lessons.stream()
                    .map(lesson -> TimeSlot.builder()
                            .time(lesson.getScheduledAt().toLocalTime())
                            .status("BOOKED")
                            .build())
                    .sorted((a, b) -> a.getTime().compareTo(b.getTime()))
                    .collect(Collectors.toList());

            return CalendarDay.builder()
                    .date(date)
                    .lessonCount(lessons.size())
                    .slots(timeSlots)
                    .build();
        }
    }

    @Getter
    @Builder(access = AccessLevel.PRIVATE)
    public static class TimeSlot {
        private LocalTime time;
        private String status; // BOOKED
    }
}
