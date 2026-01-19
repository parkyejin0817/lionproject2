package com.example.lionproject2backend.qna.service;

import com.example.lionproject2backend.global.exception.custom.CustomException;
import com.example.lionproject2backend.global.exception.custom.ErrorCode;
import com.example.lionproject2backend.lesson.domain.Lesson;
import com.example.lionproject2backend.lesson.repository.LessonRepository;
import com.example.lionproject2backend.qna.domain.Answer;
import com.example.lionproject2backend.qna.domain.Question;
import com.example.lionproject2backend.qna.dto.*;
import com.example.lionproject2backend.qna.repository.AnswerRepository;
import com.example.lionproject2backend.qna.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final LessonRepository lessonRepository;

    /**
     * 질문 등록
     * POST /api/lessons/{lessonId}/questions
     * - 멘티만 질문 등록 가능
     */

    @Transactional
    public PostQuestionResponse postQuestion(Long lessonId, Long userId, PostQuestionRequest request) {
        // 존재하는 수업인지 확인
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new CustomException(ErrorCode.LESSON_NOT_FOUND));

        // 멘티인지 확인
        if (!lesson.getMentee().getId().equals(userId)) {
            throw new CustomException(ErrorCode.QUESTION_FORBIDDEN);
        }

        // 질문 생성
        Question question = Question.create(
                lesson,
                request.getTitle(),
                request.getContent(),
                request.getCodeContent()
        );

        Question savedQuestion = questionRepository.save(question);

        return new PostQuestionResponse(savedQuestion.getId());
    }

    /**
     * 질문 목록 조회
     * GET /api/lessons/{lessonId}/questions
     * - 멘티, 멘토 조회 가능
     */

    public List<GetQuestionListResponse> getQuestions(Long lessonId, Long userId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new CustomException(ErrorCode.LESSON_NOT_FOUND));

        // 권한 확인
        boolean isMentee = lesson.getMentee().getId().equals(userId);
        boolean isMentor = lesson.getTutorial().getMentor().getUser().getId().equals(userId);

        if (!isMentee && !isMentor) {
            throw new CustomException(ErrorCode.QUESTION_FORBIDDEN);
        }

        // 질문 목록 조회
        List<Question> questions = questionRepository.findByLessonId(lessonId);

        return questions.stream()
                .map(q -> new GetQuestionListResponse(
                        q.getId(),
                        q.getTitle(),
                        q.getContent(),
                        q.getAnswers().size(),
                        q.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    /**
     * 질문 상세 조회 ( 답변 포함 )
     * GET /api/questions/{questionId}
     * - 멘티, 멘토 조회 가능
     */

    public GetQuestionDetailResponse getQuestion(Long questionId, Long userId) {
        // 질문 조회
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new CustomException(ErrorCode.QUESTION_NOT_FOUND));

        Lesson lesson = question.getLesson();

        // 권한 확인
        boolean isMentee = lesson.getMentee().getId().equals(userId);
        boolean isMentor = lesson.getTutorial().getMentor().getUser().getId().equals(userId);

        if (!isMentee && !isMentor) {
            throw new CustomException(ErrorCode.QUESTION_FORBIDDEN);
        }
        // 답변 목록 조회
        List<Answer> answers = answerRepository.findByQuestionId(questionId);

        // 멘토 닉네임 가져오기
        String mentorNickname = lesson.getTutorial().getMentor().getUser().getNickname();

        List<GetQuestionDetailResponse.AnswerDto> answerDtos = answers.stream()
                .map(a -> new GetQuestionDetailResponse.AnswerDto(
                        a.getId(),
                        mentorNickname,
                        a.getContent(),
                        a.getCreatedAt()
                ))
                .collect(Collectors.toList());

        return new GetQuestionDetailResponse(
                question.getId(),
                question.getTitle(),
                question.getContent(),
                question.getCodeContent(),
                question.getCreatedAt(),
                answerDtos
        );
    }

    /**
     * 답변 등록
     * POST /api/questions/{questionId}/answers
     * - 멘토만 가능
     */

    @Transactional
    public PostAnswerResponse postAnswer(Long questionId, Long userId, PostAnswerRequest request) {
        // 질문 조회
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new CustomException(ErrorCode.QUESTION_NOT_FOUND));

        Lesson lesson = question.getLesson();

        // 멘토인지 확인
        if (!lesson.getTutorial().getMentor().getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.ANSWER_FORBIDDEN);
        }

        // 답변 생성
        Answer answer = Answer.create(question, request.getContent());
        Answer savedAnswer = answerRepository.save(answer);

        return new PostAnswerResponse(savedAnswer.getId());
    }

    /**
     * 내 질문 목록 조회
     * GET /api/questions/my
     * - 멘티: 내가 작성한 질문
     * - 멘토: 내 과외에서 받은 질문
     */
    public List<GetQuestionListResponse> getMyQuestions(Long userId, String role) {
        List<Question> questions;

        if ("MENTOR".equals(role)) {
            questions = questionRepository.findByMentorUserId(userId);
        } else {
            questions = questionRepository.findByMenteeId(userId);
        }

        return questions.stream()
                .map(q -> new GetQuestionListResponse(
                        q.getId(),
                        q.getTitle(),
                        q.getContent(),
                        answerRepository.countByQuestionId(q.getId()),
                        q.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

}