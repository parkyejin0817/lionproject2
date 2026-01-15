import api from './client';
import type { ApiResponse } from './client';
import type { Skill } from './mentor';

// 과외 정보 타입 (백엔드 응답)
export interface Tutorial {
  id: number;
  mentorId: number;
  mentorNickname: string;
  title: string;
  description: string | null;
  price: number;
  duration: number;  // 1회 수업 시간 (분 단위)
  rating: number;
  reviewCount: number;
  status: 'ACTIVE' | 'INACTIVE';
  skills: Skill[];
  createdAt: string;
  updatedAt: string;
}

// 과외 등록 요청 타입 (백엔드: PostTutorialCreateRequest)
export interface TutorialCreateRequest {
  title: string;
  description: string;
  price: number;
  duration: number;  // 1회 수업 시간 (분 단위)
  skills: string[];  // 스킬 이름 목록 (없으면 자동 생성)
}

// 과외 수정 요청 타입 (백엔드: PutTutorialUpdateRequest - PUT 전체 수정)
export interface TutorialUpdateRequest {
  title: string;
  description: string;
  price: number;
  duration: number;  // 1회 수업 시간 (분 단위)
  skillIds: number[];
  // status는 별도 API 사용: PUT /api/tutorials/{id}/status
}

// 과외 목록 응답 타입
export interface TutorialListResponse {
  content: Tutorial[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/**
 * 과외 목록 조회 (공개)
 */
export const getTutorials = async (params?: {
  page?: number;
  size?: number;
  sort?: string;
}): Promise<ApiResponse<TutorialListResponse>> => {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined) queryParams.append('page', String(params.page));
  if (params?.size !== undefined) queryParams.append('size', String(params.size));
  if (params?.sort) queryParams.append('sort', params.sort);

  const url = `/api/tutorials${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await api.get<ApiResponse<TutorialListResponse>>(url);
  return response.data;
};

/**
 * 과외 상세 조회 (공개)
 */
export const getTutorial = async (tutorialId: number): Promise<ApiResponse<Tutorial>> => {
  const response = await api.get<ApiResponse<Tutorial>>(`/api/tutorials/${tutorialId}`);
  return response.data;
};

/**
 * 과외 검색 (공개)
 */
export const searchTutorials = async (keyword: string): Promise<ApiResponse<TutorialListResponse>> => {
  const response = await api.get<ApiResponse<TutorialListResponse>>(`/api/tutorials/search?keyword=${encodeURIComponent(keyword)}`);
  return response.data;
};

/**
 * 과외 등록 (인증 필요 - 멘토만)
 */
export const createTutorial = async (data: TutorialCreateRequest): Promise<ApiResponse<Tutorial>> => {
  const response = await api.post<ApiResponse<Tutorial>>('/api/tutorials', data);
  return response.data;
};

/**
 * 과외 수정 (인증 필요 - 멘토만)
 * 백엔드: PUT /api/tutorials/{tutorialId} - 전체 데이터 필수
 */
export const updateTutorial = async (
  tutorialId: number,
  data: TutorialUpdateRequest
): Promise<ApiResponse<Tutorial>> => {
  const response = await api.put<ApiResponse<Tutorial>>(`/api/tutorials/${tutorialId}`, data);
  return response.data;
};

/**
 * 과외 삭제 (인증 필요 - 멘토만)
 */
export const deleteTutorial = async (tutorialId: number): Promise<ApiResponse<void>> => {
  const response = await api.delete<ApiResponse<void>>(`/api/tutorials/${tutorialId}`);
  return response.data;
};

/**
 * 멘토의 과외 목록 조회
 */
export const getMentorTutorials = async (mentorId: number): Promise<ApiResponse<Tutorial[]>> => {
  const response = await api.get<ApiResponse<Tutorial[]>>(`/api/mentors/${mentorId}/tutorials`);
  return response.data;
};

/**
 * 내 과외 목록 조회 (멘토용)
 */
export const getMyTutorials = async (): Promise<ApiResponse<Tutorial[]>> => {
  const response = await api.get<ApiResponse<Tutorial[]>>('/api/tutorials/my');
  return response.data;
};
