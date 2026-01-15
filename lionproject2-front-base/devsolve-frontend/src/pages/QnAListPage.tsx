import { Link } from 'react-router-dom';
import type { Question, Lesson, Tutorial, User, Ticket } from '../types';

// 수업(Lesson) 기반 Q&A 목 데이터 (ERD 2025.01: Lesson -> Ticket -> Tutorial/User)
type QuestionWithDetails = Question & {
  lesson: Lesson & {
    ticket: Ticket & {
      tutorial: Tutorial;
      mentee: User;
    };
  };
};

const mockQuestions: QuestionWithDetails[] = [
  {
    id: 1,
    lessonId: 1,
    title: 'Spring Boot에서 JWT 토큰 만료 처리 방법이 궁금합니다',
    content: 'Access Token이 만료되었을 때 Refresh Token으로 자동 갱신하는 로직을 어떻게 구현해야 할까요?',
    codeContent: `@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    // 여기서 토큰 검증 후 만료시 어떻게 처리해야 할까요?
}`,
    createdAt: '2024-01-10T14:30:00',
    answers: [
      { id: 1, questionId: 1, content: 'RefreshToken을 HttpOnly 쿠키에 저장하고...', createdAt: '2024-01-10T15:00:00' },
      { id: 2, questionId: 1, content: '추가로 Redis를 사용하면 더 효율적입니다.', createdAt: '2024-01-10T16:00:00' },
    ],
    lesson: {
      id: 1,
      ticketId: 1,
      status: 'IN_PROGRESS',
      scheduledAt: '2024-01-15T19:00:00',
      createdAt: '2024-01-01T00:00:00',
      updatedAt: '2024-01-01T00:00:00',
      ticket: {
        id: 1,
        paymentId: 1,
        tutorialId: 1,
        menteeId: 1,
        totalCount: 4,
        remainingCount: 3,
        createdAt: '2024-01-01T00:00:00',
        tutorial: {
          id: 1,
          mentorId: 1,
          title: '주니어 풀스택 핵심 역량 강화',
          price: 450000,
          duration: 120,
          rating: 4.9,
          status: 'ACTIVE',
          skills: [{ id: 1, skillName: 'Spring Boot' }, { id: 2, skillName: 'JWT' }],
          createdAt: '2024-01-01T00:00:00',
          updatedAt: '2024-01-01T00:00:00',
        },
        mentee: {
          id: 1,
          email: 'mentee1@example.com',
          nickname: '개발초보',
          role: 'MENTEE',
          createdAt: '2024-01-01T00:00:00',
        },
      },
    },
  },
  {
    id: 2,
    lessonId: 2,
    title: 'JPA N+1 문제 해결 방법',
    content: 'fetch join을 사용해도 N+1 문제가 계속 발생합니다. @EntityGraph와 fetch join 중 어떤 걸 사용해야 할까요?',
    createdAt: '2024-01-09T10:00:00',
    answers: [
      { id: 3, questionId: 2, content: '@EntityGraph는 LEFT OUTER JOIN을 사용하고...', createdAt: '2024-01-09T11:00:00' },
    ],
    lesson: {
      id: 2,
      ticketId: 2,
      status: 'IN_PROGRESS',
      scheduledAt: '2024-01-16T20:00:00',
      createdAt: '2024-01-01T00:00:00',
      updatedAt: '2024-01-01T00:00:00',
      ticket: {
        id: 2,
        paymentId: 2,
        tutorialId: 2,
        menteeId: 2,
        totalCount: 1,
        remainingCount: 0,
        createdAt: '2024-01-01T00:00:00',
        tutorial: {
          id: 2,
          mentorId: 1,
          title: 'JPA 마스터 클래스',
          price: 80000,
          duration: 90,
          rating: 4.8,
          status: 'ACTIVE',
          skills: [{ id: 3, skillName: 'JPA' }, { id: 4, skillName: 'MySQL' }],
          createdAt: '2024-01-01T00:00:00',
          updatedAt: '2024-01-01T00:00:00',
        },
        mentee: {
          id: 2,
          email: 'mentee2@example.com',
          nickname: '백엔드러버',
          role: 'MENTEE',
          createdAt: '2024-01-01T00:00:00',
        },
      },
    },
  },
  {
    id: 3,
    lessonId: 3,
    title: 'Docker compose volume 마운트 성능 이슈',
    content: 'Mac에서 Docker volume 성능이 너무 느린데 해결 방법이 있을까요? delegated 옵션도 써봤는데...',
    createdAt: '2024-01-08T09:00:00',
    answers: [],
    lesson: {
      id: 3,
      ticketId: 3,
      status: 'IN_PROGRESS',
      scheduledAt: '2024-01-17T19:00:00',
      createdAt: '2024-01-01T00:00:00',
      updatedAt: '2024-01-01T00:00:00',
      ticket: {
        id: 3,
        paymentId: 3,
        tutorialId: 3,
        menteeId: 3,
        totalCount: 2,
        remainingCount: 1,
        createdAt: '2024-01-01T00:00:00',
        tutorial: {
          id: 3,
          mentorId: 2,
          title: 'Docker & DevOps 입문',
          price: 60000,
          duration: 60,
          rating: 4.7,
          status: 'ACTIVE',
          skills: [{ id: 5, skillName: 'Docker' }, { id: 6, skillName: 'DevOps' }],
          createdAt: '2024-01-01T00:00:00',
          updatedAt: '2024-01-01T00:00:00',
        },
        mentee: {
          id: 3,
          email: 'mentee3@example.com',
          nickname: '도커입문자',
          role: 'MENTEE',
          createdAt: '2024-01-01T00:00:00',
        },
      },
    },
  },
];

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export default function QnAListPage() {
  return (
    <div className="pt-16">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">수업 Q&A</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              진행중인 수업에서 멘토에게 질문하고 답변을 받아보세요
            </p>
          </div>
          <Link
            to="/qna/create"
            className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-xl">edit</span>
            질문 작성하기
          </Link>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">info</span>
            <div>
              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                수업 Q&A는 진행중인 수업(Lesson)에서만 작성할 수 있습니다.
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                수업을 신청하고 멘토의 승인을 받으면 질문을 작성할 수 있어요.
              </p>
            </div>
          </div>
        </div>

        {/* Filter by Lesson Status */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['전체', '내 질문', '답변 대기중', '답변 완료'].map((filter) => (
            <button
              key={filter}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === '전체'
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary/10 hover:text-primary'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Question List */}
        <div className="space-y-4">
          {mockQuestions.map((question) => (
            <Link
              key={question.id}
              to={`/qna/${question.id}`}
              className="block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:border-primary/50 transition-all group"
            >
              <div className="flex items-start gap-4">
                {/* Answer Count */}
                <div
                  className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl ${
                    question.answers && question.answers.length > 0
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-600'
                      : 'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <span className="text-xl font-bold">{question.answers?.length || 0}</span>
                  <span className="text-xs">답변</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Lesson Info Badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded">
                      {question.lesson.ticket.tutorial.title}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      question.lesson.status === 'IN_PROGRESS'
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                    }`}>
                      {question.lesson.status === 'IN_PROGRESS' ? '진행중' : question.lesson.status}
                    </span>
                  </div>

                  <h3 className="text-slate-900 dark:text-white font-bold truncate group-hover:text-primary transition-colors">
                    {question.title}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-1 mb-3 mt-1">
                    {question.content}
                  </p>

                  {/* Tags & Meta */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex gap-2">
                      {question.lesson.ticket.tutorial.skills.map((skill) => (
                        <span
                          key={skill.id}
                          className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded"
                        >
                          {skill.skillName}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-slate-400">
                      {question.lesson.ticket.mentee.nickname} · {formatDate(question.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Code indicator */}
                {question.codeContent && (
                  <div className="flex-shrink-0">
                    <span className="material-symbols-outlined text-slate-400" title="코드 포함">
                      code
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State - 수업이 없을 때 */}
        {mockQuestions.length === 0 && (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">
              quiz
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              아직 질문이 없습니다
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              진행중인 수업에서 멘토에게 질문해보세요!
            </p>
            <Link
              to="/mentors"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold"
            >
              <span className="material-symbols-outlined">search</span>
              멘토 찾아보기
            </Link>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <button className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          <button className="w-10 h-10 rounded-lg bg-primary text-white font-bold">1</button>
          <button className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
            2
          </button>
          <button className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}
