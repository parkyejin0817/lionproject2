import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import * as tutorialApi from '@/api/tutorial';
import * as reviewApi from '@/api/review';
import { useAuth } from '@/contexts/AuthContext';
import type { Tutorial } from '@/api/tutorial';
import type { Review } from '@/api/review';

// 시간 슬롯 타입 정의
type TimeSlotStatus = 'available' | 'selected' | 'booked';

interface TimeSlot {
  time: string;
  status: TimeSlotStatus;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export default function TutorialDetailPage() {
  const { tutorialId } = useParams<{ tutorialId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate] = useState<number | null>(15);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [message, setMessage] = useState('');

  // Fetch tutorial and reviews
  useEffect(() => {
    const fetchData = async () => {
      if (!tutorialId) return;

      setIsLoading(true);
      setError(null);

      try {
        const [tutorialRes, reviewsRes] = await Promise.all([
          tutorialApi.getTutorial(Number(tutorialId)),
          reviewApi.getReviews(Number(tutorialId), { size: 5 }),
        ]);

        if (tutorialRes.success && tutorialRes.data) {
          setTutorial(tutorialRes.data);
        } else {
          setError('과외 정보를 찾을 수 없습니다.');
        }

        if (reviewsRes.success && reviewsRes.data) {
          setReviews(reviewsRes.data.content);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [tutorialId]);

  // 시간 슬롯 데이터 (09:00~20:00)
  const initialTimeSlots: TimeSlot[] = [
    { time: '09:00', status: 'available' },
    { time: '10:00', status: 'booked' },
    { time: '11:00', status: 'available' },
    { time: '12:00', status: 'available' },
    { time: '13:00', status: 'booked' },
    { time: '14:00', status: 'available' },
    { time: '15:00', status: 'available' },
    { time: '16:00', status: 'booked' },
    { time: '17:00', status: 'available' },
    { time: '18:00', status: 'available' },
    { time: '19:00', status: 'available' },
    { time: '20:00', status: 'booked' },
  ];

  const getTimeSlotStyle = (slot: TimeSlot, isSelected: boolean) => {
    if (isSelected) {
      return 'bg-primary text-primary-foreground border-primary font-semibold';
    }
    if (slot.status === 'booked') {
      return 'bg-muted text-muted-foreground cursor-not-allowed line-through';
    }
    return 'bg-background hover:bg-primary/10 hover:border-primary/50 cursor-pointer';
  };

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    );
  }

  if (error || !tutorial) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-muted-foreground mb-4">error</span>
          <p className="text-lg text-muted-foreground">{error || '과외를 찾을 수 없습니다.'}</p>
          <Button className="mt-4" onClick={() => navigate('/mentors')}>
            멘토 목록으로
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16">
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">홈</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <Link to="/mentors" className="hover:text-primary">과외 찾기</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-foreground font-medium">과외 상세 정보</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{tutorial.title}</h1>

          <div className="flex flex-wrap items-center gap-6">
            <Link to={`/mentor/${tutorial.mentorId}`} className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{tutorial.mentorNickname?.[0] || 'M'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-primary font-semibold hover:underline flex items-center gap-1">
                  {tutorial.mentorNickname}
                  <span className="material-symbols-outlined text-xs">open_in_new</span>
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-2 border-l pl-6 h-10">
              <div className="flex text-amber-400">
                {[...Array(Math.floor(tutorial.rating || 0))].map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                ))}
                {(tutorial.rating || 0) % 1 >= 0.5 && (
                  <span className="material-symbols-outlined text-sm">star_half</span>
                )}
              </div>
              <span className="font-bold">{tutorial.rating?.toFixed(1) || '0.0'}</span>
              <span className="text-muted-foreground text-sm">({tutorial.reviewCount || 0}개의 리뷰)</span>
            </div>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-2 mt-6">
            {tutorial.skills.map((skill) => (
              <Badge key={skill.id} variant="secondary">{skill.name}</Badge>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-10">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/50 p-6 rounded-xl border">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-xs">회당 가격</span>
                <span className="font-bold">₩{tutorial.price.toLocaleString()}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-xs">수업 시간</span>
                <span className="font-bold">{tutorial.duration}분</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-xs">난이도</span>
                <span className="font-bold">중급</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-xs">방식</span>
                <span className="font-bold">온라인 (줌/구글밋)</span>
              </div>
            </div>

            {/* Description */}
            <section>
              <h2 className="text-xl font-bold mb-4 border-l-4 border-primary pl-4">
                과외 상세 설명
              </h2>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {tutorial.description || '상세 설명이 없습니다.'}
              </div>
            </section>

            {/* Reviews */}
            <section className="pt-6 border-t">
              <h2 className="text-xl font-bold mb-6">수업 후기</h2>
              {reviews.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">아직 작성된 리뷰가 없습니다.</p>
              ) : (
                <div className="space-y-10">
                  {reviews.map((review) => (
                    <div key={review.id} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{review.menteeNickname?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">{review.menteeNickname}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-amber-400 mt-0.5">
                            {[...Array(review.rating)].map((_, i) => (
                              <span
                                key={i}
                                className="material-symbols-outlined text-sm"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >
                                star
                              </span>
                            ))}
                            <span className="text-foreground text-xs font-bold ml-1">{review.rating}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{review.content}</p>
                    </div>
                  ))}
                  {reviews.length >= 5 && (
                    <Button variant="outline" className="w-full">더보기</Button>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-[380px]">
            <div className="sticky top-24 space-y-4">
              {/* CTA Card */}
              <Card className="shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-2xl font-bold">₩{tutorial.price.toLocaleString()}</span>
                    <span className="text-muted-foreground text-sm">/ 1회</span>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-muted-foreground">schedule</span>
                      <span>1회 {tutorial.duration}분 수업</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-muted-foreground">chat_bubble</span>
                      <span>평균 응답 시간 1시간 이내</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-emerald-500">
                      <span className="material-symbols-outlined">check_circle</span>
                      <span className="font-medium">수업 전 무료 상담 15분 제공</span>
                    </div>
                  </div>

                  <Button
                    className="w-full h-12 shadow-lg shadow-primary/20 mb-3"
                    onClick={handleApplyClick}
                  >
                    수업 신청하기
                    <span className="material-symbols-outlined ml-2">arrow_forward</span>
                  </Button>
                  <Button variant="secondary" className="w-full">
                    문의하기 (실시간 채팅)
                  </Button>
                </CardContent>
              </Card>

              {/* Availability Card */}
              <Card className="bg-muted/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">현재 예약 현황</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1 text-center mb-4">
                    {['월', '화', '수', '목', '금', '토', '일'].map((day) => (
                      <div key={day} className="text-[10px] text-muted-foreground uppercase">
                        {day}
                      </div>
                    ))}
                    {[
                      { status: 'smooth', label: '원활' },
                      { status: 'smooth', label: '원활' },
                      { status: 'slight', label: '조금' },
                      { status: 'busy', label: '혼잡' },
                      { status: 'smooth', label: '원활' },
                      { status: 'unavailable', label: '불가' },
                      { status: 'unavailable', label: '불가' },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className={`h-7 rounded flex items-center justify-center text-[9px] font-medium ${
                          item.status === 'smooth'
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : item.status === 'slight'
                            ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                            : item.status === 'busy'
                            ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {item.label}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> 원활
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-yellow-500" /> 조금 혼잡
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-orange-500" /> 혼잡
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground" /> 불가
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>

        {/* 수업 신청서 팝업 */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-[640px] p-0 gap-0 overflow-hidden">
            <DialogHeader className="px-8 pt-8 pb-4">
              <DialogTitle className="text-2xl font-bold">수업 신청하기</DialogTitle>
            </DialogHeader>

            <div className="px-8 py-4 space-y-6">
              {/* Summary Card */}
              <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-5 border">
                <div className="w-20 h-20 bg-primary/20 rounded-lg flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-4xl text-primary">school</span>
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">선택한 수업</p>
                  <p className="text-lg font-bold leading-tight">{tutorial.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-primary text-sm font-medium">1:1 맞춤형 멘토링</p>
                    <p className="text-lg font-bold">₩{tutorial.price.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Date & Time Section */}
              <div className="space-y-4">
                {/* Selected Date Display */}
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-2xl">calendar_today</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">선택한 날짜</p>
                    <p className="font-bold">2024년 5월 {selectedDate}일 (수)</p>
                  </div>
                </div>

                {/* Time Slots Grid */}
                <div className="space-y-3">
                  <label className="block font-semibold">시간 선택</label>
                  <div className="grid grid-cols-4 gap-2">
                    {initialTimeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => slot.status !== 'booked' && setSelectedTime(slot.time)}
                        disabled={slot.status === 'booked'}
                        className={`py-3 px-2 rounded-lg border text-sm transition-all ${getTimeSlotStyle(slot, selectedTime === slot.time)}`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-primary"></span>
                      선택됨
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-muted border"></span>
                      예약 완료
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-background border"></span>
                      선택 가능
                    </span>
                  </div>
                </div>
              </div>

              {/* Message Section */}
              <div className="space-y-3">
                <label className="block font-semibold">멘토에게 전달할 메시지</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 500))}
                  placeholder="배우고 싶은 내용을 상세히 적어주세요 (예: 특정 코드 리뷰 요청, 아키텍처 상담 등)"
                  className="min-h-[120px] resize-none"
                />
                <p className="text-right text-muted-foreground text-xs">{message.length} / 500</p>
              </div>
            </div>

            {/* Action Footer */}
            <div className="px-8 py-6 bg-muted/50 flex items-center justify-end gap-3 border-t">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                취소
              </Button>
              <Button className="shadow-lg" asChild>
                <Link to={`/payment/${tutorial.id}`}>
                  <span>신청 및 결제하기</span>
                  <span className="material-symbols-outlined text-[20px] ml-2">payments</span>
                </Link>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
