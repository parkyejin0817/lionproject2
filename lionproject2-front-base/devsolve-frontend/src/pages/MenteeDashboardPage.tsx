import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import * as lessonApi from '@/api/lesson';
import * as paymentApi from '@/api/payment';
import * as authApi from '@/api/auth';
import type { Lesson } from '@/api/lesson';
import type { Ticket } from '@/api/payment';

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function getStatusLabel(status: string): { label: string; className: string } {
    const statusMap: Record<string, { label: string; className: string }> = {
        REQUESTED: { label: '신청중', className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' },
        CONFIRMED: { label: '확정', className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
        IN_PROGRESS: { label: '진행중', className: 'bg-green-100 dark:bg-green-900/30 text-green-600' },
        COMPLETED: { label: '완료', className: 'bg-slate-100 dark:bg-slate-900/30 text-slate-600' },
        REJECTED: { label: '거절됨', className: 'bg-red-100 dark:bg-red-900/30 text-red-600' },
    };
    return statusMap[status] || { label: status, className: 'bg-slate-100 text-slate-600' };
}

export default function MenteeDashboardPage() {
    const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
    const navigate = useNavigate();

    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 프로필 수정 상태
    const [isEditing, setIsEditing] = useState(false);
    const [nickname, setNickname] = useState('');
    const [introduction, setIntroduction] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
            return;
        }

        if (!authLoading && isAuthenticated) {
            fetchData();
            // 유저 정보로 초기값 설정
            if (user) {
                setNickname(user.nickname || '');
                setIntroduction(user.introduction || '');
            }
        }
    }, [authLoading, isAuthenticated, navigate, user]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [lessonsRes, ticketsRes] = await Promise.all([
                lessonApi.getMyLessons(),
                paymentApi.getMyTickets(),
            ]);

            if (lessonsRes.success && lessonsRes.data) {
                setLessons(lessonsRes.data.lessons);
            }
            if (ticketsRes.success && ticketsRes.data) {
                setTickets(ticketsRes.data);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // 프로필 수정 저장
    const handleSaveProfile = async () => {
        if (!nickname.trim()) {
            setSaveMessage('닉네임을 입력해주세요.');
            return;
        }

        setIsSaving(true);
        setSaveMessage('');

        try {
            const response = await authApi.updateProfile({
                nickname: nickname.trim(),
                introduction: introduction.trim() || null,
            });

            if (response.success) {
                setSaveMessage('프로필이 수정되었습니다.');
                setIsEditing(false);
                // 유저 정보 갱신
                if (refreshUser) {
                    await refreshUser();
                }
            } else {
                setSaveMessage(response.message || '수정에 실패했습니다.');
            }
        } catch (error: any) {
            setSaveMessage(error.response?.data?.message || '수정에 실패했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    // 수정 취소
    const handleCancelEdit = () => {
        setNickname(user?.nickname || '');
        setIntroduction(user?.introduction || '');
        setIsEditing(false);
        setSaveMessage('');
    };

    if (authLoading || isLoading) {
        return (
            <div className="pt-16 min-h-screen flex items-center justify-center">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
            </div>
        );
    }

    // Active lessons (not completed or rejected)
    const activeLessons = lessons.filter(l => !['COMPLETED', 'REJECTED'].includes(l.status));

    return (
        <div className="pt-16">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">마이페이지</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            안녕하세요, {user?.nickname}님!
                        </p>
                    </div>
                    <Link
                        to="/tutorials"
                        className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-primary/20 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">search</span>
                        강의 찾기
                    </Link>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* My Lessons */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Active Tickets */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">보유 수강권</h2>
                            {tickets.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    <span className="material-symbols-outlined text-4xl mb-2">confirmation_number</span>
                                    <p>보유 중인 수강권이 없습니다.</p>
                                    <Link to="/tutorials" className="text-primary font-medium mt-2 inline-block hover:underline">
                                        강의 찾아보기
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {tickets.map((ticket) => (
                                        <div
                                            key={ticket.id}
                                            className="p-5 bg-slate-50 dark:bg-slate-900 rounded-xl"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white">{ticket.tutorialTitle}</p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">{ticket.mentorNickname} 멘토</p>
                                                </div>
                                                <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                          {ticket.remainingCount}회 남음
                        </span>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">사용 현황</span>
                                                    <span className="font-medium text-slate-900 dark:text-white">
                            {ticket.totalCount - ticket.remainingCount}/{ticket.totalCount} 회차
                          </span>
                                                </div>
                                                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary rounded-full"
                                                        style={{ width: `${((ticket.totalCount - ticket.remainingCount) / ticket.totalCount) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recent Lessons */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">진행중인 수업</h2>
                            {activeLessons.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    <span className="material-symbols-outlined text-4xl mb-2">school</span>
                                    <p>진행중인 수업이 없습니다.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {activeLessons.slice(0, 5).map((lesson) => {
                                        const status = getStatusLabel(lesson.status);
                                        return (
                                            <div key={lesson.lessonId} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-lg text-blue-600">school</span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-medium text-slate-900 dark:text-white">{lesson.tutorialTitle}</p>
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${status.className}`}>
                              {status.label}
                            </span>
                                                    </div>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                                        {lesson.mentorName} 멘토
                                                    </p>
                                                    {lesson.scheduledAt && (
                                                        <p className="text-xs text-slate-400 mt-1">
                                                            예정: {formatDate(lesson.scheduledAt)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">빠른 메뉴</h2>
                            <div className="space-y-3">
                                <Link
                                    to="/qna"
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-primary">help</span>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Q&A</span>
                                </Link>
                                <Link
                                    to="/mypage/payments"
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-primary">receipt_long</span>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">결제 내역</span>
                                </Link>
                            </div>
                        </div>

                        {/* Profile Edit */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">내 프로필</h2>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-sm text-primary hover:text-blue-600 font-medium"
                                    >
                                        수정
                                    </button>
                                )}
                            </div>

                            {isEditing ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            닉네임
                                        </label>
                                        <input
                                            type="text"
                                            value={nickname}
                                            onChange={(e) => setNickname(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="닉네임 입력"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            자기소개
                                        </label>
                                        <textarea
                                            value={introduction}
                                            onChange={(e) => setIntroduction(e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                            placeholder="자기소개를 입력하세요"
                                        />
                                    </div>

                                    {saveMessage && (
                                        <p className={`text-sm ${saveMessage.includes('실패') || saveMessage.includes('입력') ? 'text-red-500' : 'text-green-500'}`}>
                                            {saveMessage}
                                        </p>
                                    )}

                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={isSaving}
                                            className="flex-1 bg-primary hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                        >
                                            {isSaving ? '저장 중...' : '저장'}
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            disabled={isSaving}
                                            className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 py-2 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            취소
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-blue-600">person</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{user?.nickname}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {user?.introduction || '자기소개가 없습니다.'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
