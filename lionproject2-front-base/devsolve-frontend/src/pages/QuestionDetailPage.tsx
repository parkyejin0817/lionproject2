import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Question, Lesson, Tutorial, User, Answer, Ticket } from '@/types';

// Mock 데이터 (ERD 2025.01: Lesson -> Ticket -> Tutorial/User)
const mockQuestion: Question & {
  lesson: Lesson & { ticket: Ticket & { tutorial: Tutorial; mentee: User } };
  answers: (Answer & { mentor: User })[];
} = {
  id: 1,
  lessonId: 1,
  title: 'React useEffect hook에서 메모리 누수가 발생합니다. 어떻게 해결하나요?',
  content: `안녕하세요! 현재 React 프로젝트를 진행 중인데, 특정 컴포넌트에서 API를 호출하고 데이터를 받아오는 과정에서 메모리 누수 경고(Memory Leak Warning)가 발생하고 있습니다.

사용자가 페이지를 빠르게 이동할 때, 컴포넌트가 언마운트 되었음에도 불구하고 fetch 작업이 완료되어 상태를 업데이트하려고 할 때 발생하는 것 같아요. 클린업 함수(cleanup function)를 어떻게 작성해야 할지 감이 잘 오지 않습니다.`,
  codeContent: `useEffect(() => {
  const fetchData = async () => {
    const response = await fetch(\`/api/user/\${userId}\`);
    const result = await response.json();
    // 여기서 에러가 발생합니다: "Can't perform a React state update on an unmounted component"
    setData(result);
  };

  fetchData();
}, [userId]);`,
  createdAt: '2024-01-10T10:00:00',
  lesson: {
    id: 1,
    ticketId: 1,
    status: 'IN_PROGRESS',
    scheduledAt: '2024-01-15T19:00:00',
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-10T00:00:00',
    ticket: {
      id: 1,
      paymentId: 1,
      tutorialId: 1,
      menteeId: 10,
      totalCount: 4,
      remainingCount: 3,
      createdAt: '2024-01-01T00:00:00',
      tutorial: {
        id: 1,
        mentorId: 1,
        title: 'React & Next.js 실무 마스터 클래스',
        description: '프론트엔드 개발의 핵심을 배웁니다',
        price: 150000,
        duration: 60,
        rating: 4.9,
        status: 'ACTIVE',
        skills: [
          { id: 1, skillName: 'React' },
          { id: 2, skillName: 'Next.js' },
        ],
        createdAt: '2023-06-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00',
      },
      mentee: {
        id: 10,
        email: 'student@example.com',
        nickname: 'dev_student101',
        role: 'MENTEE',
        createdAt: '2023-01-01T00:00:00',
      },
    },
  },
  answers: [
    {
      id: 1,
      questionId: 1,
      mentorId: 1,
      content: `좋은 질문이에요! 이 문제는 컴포넌트가 언마운트된 후에도 비동기 작업이 계속 진행되어 상태를 업데이트하려고 할 때 발생합니다.

해결 방법은 크게 두 가지가 있습니다:

**1. AbortController 사용 (권장)**
\`\`\`javascript
useEffect(() => {
  const controller = new AbortController();

  const fetchData = async () => {
    try {
      const response = await fetch(\`/api/user/\${userId}\`, {
        signal: controller.signal
      });
      const result = await response.json();
      setData(result);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error(error);
      }
    }
  };

  fetchData();

  return () => controller.abort();
}, [userId]);
\`\`\`

**2. 플래그 변수 사용**
\`\`\`javascript
useEffect(() => {
  let isMounted = true;

  const fetchData = async () => {
    const response = await fetch(\`/api/user/\${userId}\`);
    const result = await response.json();
    if (isMounted) {
      setData(result);
    }
  };

  fetchData();

  return () => { isMounted = false; };
}, [userId]);
\`\`\`

AbortController를 사용하면 실제로 네트워크 요청도 취소되므로 더 효율적입니다.`,
      isAccepted: false,
      createdAt: '2024-01-10T12:00:00',
      mentor: {
        id: 1,
        email: 'mentor@example.com',
        nickname: 'DevMaster Kim',
        role: 'MENTOR',
        createdAt: '2022-01-01T00:00:00',
      },
    },
    {
      id: 2,
      questionId: 1,
      mentorId: 2,
      content: `추가로 React Query나 SWR 같은 데이터 fetching 라이브러리를 사용하면 이런 문제를 자동으로 처리해줍니다.

예를 들어 React Query를 사용하면:
\`\`\`javascript
const { data, isLoading } = useQuery(['user', userId], () =>
  fetch(\`/api/user/\${userId}\`).then(res => res.json())
);
\`\`\`

이렇게 간단하게 처리할 수 있고, 컴포넌트가 언마운트되면 자동으로 요청을 취소해줍니다.`,
      isAccepted: false,
      createdAt: '2024-01-10T14:00:00',
      mentor: {
        id: 2,
        email: 'mentor2@example.com',
        nickname: 'React Pro',
        role: 'MENTOR',
        createdAt: '2022-06-01T00:00:00',
      },
    },
  ],
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 24) {
    return `${hours}시간 전`;
  }
  return date.toLocaleDateString('ko-KR');
}

export default function QuestionDetailPage() {
  useParams(); // Will use questionId when fetching real data
  const question = mockQuestion;

  // 답변 목록을 state로 관리 (채택 기능을 위해)
  type AnswerWithMentor = Answer & { mentor: User };
  const [answers, setAnswers] = useState<AnswerWithMentor[]>(mockQuestion.answers);

  // 질문 작성자 여부 (현재는 mock으로 true, 나중에 실제 인증 상태로 변경)
  const isQuestionAuthor = true;

  // 답변 채택 핸들러
  const handleAcceptAnswer = (answerId: number) => {
    // 기존 채택된 답변이 있으면 해제하고, 새로운 답변 채택
    setAnswers(prev => prev.map(a => ({
      ...a,
      isAccepted: a.id === answerId
    })));
    alert('답변을 채택했습니다!');
  };

  return (
    <div className="pt-16">
      <main className="max-w-[1000px] mx-auto px-6 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
          <Link to="/qna" className="hover:text-primary">질문 리스트</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <Link to="#" className="hover:text-primary">React & Next.js</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-foreground">질문 상세</span>
        </nav>

        {/* Question Header */}
        <section className="mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl lg:text-4xl font-black leading-tight tracking-tight">
                {question.title}
              </h1>
              <Badge variant="destructive" className="shrink-0">긴급 도움</Badge>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground text-sm">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {question.lesson.ticket.mentee.nickname[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold text-foreground">{question.lesson.ticket.mentee.nickname}</span>
              </div>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">schedule</span>
                {formatDate(question.createdAt)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">visibility</span>
                조회수 128
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              {question.lesson.ticket.tutorial.skills.map((skill) => (
                <Badge key={skill.id} className="uppercase">{skill.skillName}</Badge>
              ))}
              <Badge variant="secondary">Hooks</Badge>
              <Badge variant="secondary">JavaScript</Badge>
              <Badge variant="secondary">Memory Management</Badge>
            </div>
          </div>
        </section>

        {/* Question Content */}
        <div className="space-y-8">
          {/* Problem Description */}
          <Card>
            <CardContent className="p-0">
              <div className="px-6 py-4 border-b bg-muted/30">
                <h3 className="font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">description</span>
                  문제 설명
                </h3>
              </div>
              <div className="p-6 text-muted-foreground leading-relaxed space-y-4">
                {question.content.split('\n\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>

              {/* Code Block */}
              {question.codeContent && (
                <div className="px-6 pb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-muted-foreground">App.js / UserProfile.tsx</span>
                    <Button variant="link" size="sm" className="text-xs h-auto p-0">
                      <span className="material-symbols-outlined text-sm mr-1">content_copy</span>
                      코드 복사
                    </Button>
                  </div>
                  <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                    <pre className="text-slate-300">
                      <code>{question.codeContent}</code>
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Answers */}
          {answers.map((answer) => (
            <Card key={answer.id} className={answer.isAccepted ? 'border-green-500/50' : ''}>
              <CardContent className="p-0">
                <div className="px-6 py-4 border-b bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{answer.mentor?.nickname?.[0] || 'M'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold">{answer.mentor?.nickname || '멘토'}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(answer.createdAt)}</p>
                    </div>
                  </div>
                  {/* 채택 상태 또는 채택 버튼 */}
                  <div className="flex items-center gap-2">
                    {answer.isAccepted ? (
                      <Badge className="bg-green-500">
                        <span className="material-symbols-outlined text-sm mr-1">check</span>
                        채택된 답변
                      </Badge>
                    ) : isQuestionAuthor && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAcceptAnswer(answer.id)}
                        className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                      >
                        <span className="material-symbols-outlined text-sm mr-1">check_circle</span>
                        채택하기
                      </Button>
                    )}
                  </div>
                </div>
                <div className="p-6 prose dark:prose-invert max-w-none">
                  {answer.content.split('\n\n').map((paragraph, i) => {
                    if (paragraph.startsWith('```')) {
                      const code = paragraph.replace(/```\w*\n?/g, '');
                      return (
                        <pre key={i} className="bg-slate-900 dark:bg-slate-950 rounded-lg p-4 text-sm overflow-x-auto">
                          <code className="text-slate-300">{code}</code>
                        </pre>
                      );
                    }
                    if (paragraph.startsWith('**')) {
                      return (
                        <p key={i} className="font-bold text-foreground">
                          {paragraph.replace(/\*\*/g, '')}
                        </p>
                      );
                    }
                    return <p key={i} className="text-muted-foreground">{paragraph}</p>;
                  })}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Answer Editor */}
          <div className="flex items-center justify-between pt-4 border-t">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">edit_note</span>
              멘토님의 해결책을 작성해주세요
            </h2>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
              멘토 자동 저장 활성화됨
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <span className="material-symbols-outlined">format_bold</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <span className="material-symbols-outlined">format_italic</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <span className="material-symbols-outlined">format_list_bulleted</span>
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <span className="material-symbols-outlined">code</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <span className="material-symbols-outlined">image</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <span className="material-symbols-outlined">link</span>
                </Button>
                <div className="ml-auto flex items-center gap-4 px-2">
                  <span className="text-xs text-muted-foreground">Markdown 지원</span>
                </div>
              </div>

              <Textarea
                placeholder="해결 방법, 코드 예시, 그리고 주의할 점을 상세히 작성해주세요..."
                className="min-h-[300px] border-0 rounded-none focus-visible:ring-0 resize-none"
              />

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/30">
                <Button variant="ghost" size="sm">
                  <span className="material-symbols-outlined text-lg mr-2">attach_file</span>
                  파일 첨부
                </Button>
                <div className="flex gap-3">
                  <Button variant="secondary">임시 저장</Button>
                  <Button className="shadow-lg shadow-primary/20">답변 등록하기</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Similar Questions */}
          <footer className="pt-12 pb-20">
            <h3 className="text-lg font-bold mb-4">비슷한 문제 해결 사례</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="#"
                className="p-4 rounded-lg border bg-card hover:border-primary/50 group transition-all"
              >
                <p className="text-sm font-bold group-hover:text-primary transition-colors">
                  AbortController를 사용한 fetch 취소 방법
                </p>
                <p className="text-xs text-muted-foreground mt-2">조회수 2.4k • 채택된 답변 1</p>
              </Link>
              <Link
                to="#"
                className="p-4 rounded-lg border bg-card hover:border-primary/50 group transition-all"
              >
                <p className="text-sm font-bold group-hover:text-primary transition-colors">
                  React 18에서 useEffect가 두 번 실행되는 이유
                </p>
                <p className="text-xs text-muted-foreground mt-2">조회수 5.1k • 채택된 답변 3</p>
              </Link>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
