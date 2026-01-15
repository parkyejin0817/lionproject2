import api from './client';
import type { ApiResponse } from './client';

// 결제 상태
export type PaymentStatus = 'PENDING' | 'PAID' | 'CANCELLED';

// 결제 생성 응답 타입
export interface PaymentCreateResponse {
  paymentId: number;
  merchantUid: string;
  amount: number;
  tutorialTitle: string;
}

// 결제 검증 응답 타입
export interface PaymentVerifyResponse {
  ticketId: number;
  remainingCount: number;
  message: string;
}

// 티켓 정보 타입 (백엔드 GetTicketResponse 매핑)
export interface Ticket {
  id: number;
  tutorialId: number;
  tutorialTitle: string;
  mentorNickname: string;
  totalCount: number;
  remainingCount: number;
  expiredAt: string | null;
  expired: boolean;
  createdAt: string;
}

// 결제 내역 타입
export interface PaymentHistory {
  id: number;
  tutorialId: number;
  tutorialTitle: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod: string;
  paidAt: string | null;
  createdAt: string;
}

/**
 * 결제 생성 (백엔드: PaymentCreateRequest)
 * @param count - 구매할 이용권 횟수 (백엔드: @NotNull @Min(1))
 */
export const createPayment = async (
  tutorialId: number,
  count: number
): Promise<ApiResponse<PaymentCreateResponse>> => {
  const response = await api.post<ApiResponse<PaymentCreateResponse>>(
    `/api/tutorials/${tutorialId}/payments`,
    { count }
  );
  return response.data;
};

/**
 * 결제 검증 (PortOne 결제 후)
 * 백엔드: PaymentVerifyRequest - impUid 필드 (@NotBlank)
 */
export const verifyPayment = async (
  paymentId: number,
  impUid: string
): Promise<ApiResponse<PaymentVerifyResponse>> => {
  const response = await api.post<ApiResponse<PaymentVerifyResponse>>(
    `/api/payments/${paymentId}/verify`,
    { impUid }  // 백엔드 필드명에 맞춤
  );
  return response.data;
};

/**
 * 내 티켓 목록 조회
 */
export const getMyTickets = async (): Promise<ApiResponse<Ticket[]>> => {
  const response = await api.get<ApiResponse<Ticket[]>>('/api/tickets/my');
  return response.data;
};

/**
 * 내 결제 내역 조회
 */
export const getMyPayments = async (): Promise<ApiResponse<PaymentHistory[]>> => {
  const response = await api.get<ApiResponse<PaymentHistory[]>>('/api/payments/my');
  return response.data;
};
