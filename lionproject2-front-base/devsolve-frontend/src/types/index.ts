// DB 스키마 기반 타입 정의 (ERD 2025.01 기준)

export type UserRole = 'MENTOR' | 'MENTEE';
export type MentorStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type TutorialStatus = 'ACTIVE' | 'INACTIVE';
export type LessonStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'REFUNDED';

export interface User {
  id: number;
  email: string;
  nickname: string;
  role: UserRole;
  introduction?: string;
  profileImage?: string;  // ERD에 없음 - 백엔드에 추가 요청 필요
  createdAt: string;
}

export interface Mentor {
  id: number;
  userId: number;
  user?: User;
  career?: string;
  status: MentorStatus;
  reviewCount: number;
  skills: Skill[];
  createdAt: string;
}

export interface Skill {
  id: number;
  skillName: string;
}

export interface Tutorial {
  id: number;
  mentorId: number;
  mentor?: Mentor;
  title: string;
  description?: string;
  price: number;
  duration: number; // 분 단위
  rating: number;
  status: TutorialStatus;
  skills: Skill[];
  createdAt: string;
  updatedAt: string;
}

// 새로 추가된 티켓 테이블
export interface Ticket {
  id: number;
  paymentId: number;
  payment?: Payment;
  tutorialId: number;
  tutorial?: Tutorial;
  menteeId: number;
  mentee?: User;
  totalCount: number;      // 총 구매 횟수
  remainingCount: number;  // 남은 횟수
  expiredAt?: string;      // 유효기간
  createdAt: string;
}

// Lesson: tutorialId, menteeId → ticketId로 변경됨
export interface Lesson {
  id: number;
  ticketId: number;        // 변경: tutorialId, menteeId 대신 ticketId
  ticket?: Ticket;
  status: LessonStatus;
  requestMessage?: string;
  rejectReason?: string;
  scheduledAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: number;
  lessonId: number;
  lesson?: Lesson;
  title: string;
  content: string;
  codeContent?: string;
  answers?: Answer[];
  createdAt: string;
}

// Answer: mentorId, isAccepted 필드가 ERD에 없음 (백엔드에 추가 요청 필요)
export interface Answer {
  id: number;
  questionId: number;
  mentorId?: number;      // ERD에 없음 - 백엔드에 추가 요청 필요
  mentor?: User;
  content: string;
  isAccepted?: boolean;   // ERD에 없음 - 백엔드에 추가 요청 필요
  createdAt: string;
}

// Payment: lessonId → tutorialId, menteeId, count로 변경됨
export interface Payment {
  id: number;
  tutorialId: number;      // 변경: lessonId → tutorialId
  tutorial?: Tutorial;
  menteeId: number;        // 추가
  mentee?: User;
  amount: number;
  count: number;           // 추가: 구매 횟수
  status: PaymentStatus;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Review: lessonId → tutorialId로 변경됨
export interface Review {
  id: number;
  tutorialId: number;      // 변경: lessonId → tutorialId
  tutorial?: Tutorial;
  menteeId: number;
  mentee?: User;
  mentorId: number;
  mentor?: Mentor;
  rating: number;
  content?: string;
  createdAt: string;
}
