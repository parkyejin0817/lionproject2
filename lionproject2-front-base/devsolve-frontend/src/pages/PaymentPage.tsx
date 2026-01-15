import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Tutorial, Mentor, User } from '../types';

// 결제할 튜토리얼 목 데이터
const mockTutorial: Tutorial & { mentor: Mentor & { user: User } } = {
  id: 1,
  mentorId: 1,
  title: 'React 성능 최적화 마스터 클래스',
  description: 'PROFESSIONAL COURSE',
  price: 55000,
  duration: 60,
  rating: 4.9,
  status: 'ACTIVE',
  skills: [
    { id: 1, skillName: 'React' },
    { id: 2, skillName: 'Performance' },
  ],
  createdAt: '2023-06-01T00:00:00',
  updatedAt: '2024-01-01T00:00:00',
  mentor: {
    id: 1,
    userId: 1,
    career: '7년차 프론트엔드 개발자',
    status: 'APPROVED',
    reviewCount: 128,
    skills: [],
    createdAt: '2023-01-01T00:00:00',
    user: {
      id: 1,
      email: 'devmaster@example.com',
      nickname: 'DevMaster',
      role: 'MENTOR',
      createdAt: '2023-01-01T00:00:00',
    },
  },
};

// 포트원 설정 (실제 배포 시 환경 변수로 관리)
const PORTONE_CONFIG = {
  storeId: 'store-4ff4af41-85e3-4559-8eb8-0d08a2c6ceec',  // 백엔드에서 제공받은 실제 storeId로 변경 필요
  channelKey: 'channel-key-9987f423-e02d-4c2f-92a0-be0bab348891', // 백엔드에서 제공받은 실제 channelKey로 변경 필요
};

export default function PaymentPage() {
  useParams(); // tutorialId를 사용할 예정
  const navigate = useNavigate();
  const tutorial = mockTutorial;

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | 'easy'>('card');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lessonCount, setLessonCount] = useState(4);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

  // 수업 횟수 제한
  const MIN_LESSON_COUNT = 1;
  const MAX_LESSON_COUNT = 12;

  // 금액 계산
  const orderAmount = tutorial.price * lessonCount;
  const couponDiscount = appliedCoupon?.discount || 0;
  const pointUsed = 0;
  const totalAmount = orderAmount - couponDiscount - pointUsed;

  // 수업 횟수 증감
  const handleIncrease = () => {
    if (lessonCount < MAX_LESSON_COUNT) {
      setLessonCount(prev => prev + 1);
    }
  };

  const handleDecrease = () => {
    if (lessonCount > MIN_LESSON_COUNT) {
      setLessonCount(prev => prev - 1);
    }
  };

  // 쿠폰 조회
  const handleCouponLookup = () => {
    if (couponCode.trim()) {
      // Mock 쿠폰 적용
      if (couponCode === 'WELCOME20') {
        setAppliedCoupon({ code: couponCode, discount: 20000 });
        alert('쿠폰이 적용되었습니다!');
      } else {
        alert('유효하지 않은 쿠폰 코드입니다.');
      }
    } else {
      // 보유 쿠폰 조회 시뮬레이션
      alert('보유 중인 쿠폰 2개가 있습니다.');
    }
  };

  // 결제 수단 매핑
  const getPayMethod = () => {
    switch (paymentMethod) {
      case 'card': return 'CARD';
      case 'transfer': return 'TRANSFER';
      case 'easy': return 'EASY_PAY';
      default: return 'CARD';
    }
  };

  const handlePayment = async () => {
    if (!agreeTerms) {
      alert('이용약관에 동의해주세요.');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. 주문 번호 생성 (LION + 타임스탬프)
      const orderPaymentId = "LION-" + new Date().getTime();
      const orderAmount = totalAmount;

      // 2. 포트원 결제창 호출
      const response = await PortOne.requestPayment({
        storeId: PORTONE_CONFIG.storeId,
        channelKey: PORTONE_CONFIG.channelKey,
        paymentId: orderPaymentId,
        orderName: tutorial.title,
        totalAmount: orderAmount,
        currency: "CURRENCY_KRW",
        payMethod: getPayMethod() as 'CARD' | 'TRANSFER' | 'EASY_PAY',
        customer: {
          fullName: "사용자",  // 실제 서비스에선 로그인된 유저 정보 사용
          phoneNumber: "010-0000-0000",
          email: "user@example.com",
        },
        windowType: {
          pc: "IFRAME"
        }
      });

      // 3. 결제창 단계에서 에러가 난 경우 처리
      if (response.code != null) {
        alert("결제 실패: " + response.message);
        setIsProcessing(false);
        return;
      }

      // 4. 백엔드로 검증 및 DB 저장 요청
      // 백엔드 PaymentVerifyRequest: impUid 필드만 필요 (@NotBlank)
      const verifyRes = await fetch("/api/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          impUid: response.paymentId,  // PortOne paymentId를 impUid로 전송
        })
      });

      if (verifyRes.ok) {
        // 결제 성공 - 완료 페이지로 이동
        navigate('/payment/complete', {
          state: {
            paymentId: response.paymentId,
            tutorialTitle: tutorial.title,
            amount: totalAmount,
            mentorName: tutorial.mentor.user.nickname,
          }
        });
      } else {
        const errorText = await verifyRes.text();
        alert("서버 검증 실패: " + errorText);
      }

    } catch (error) {
      console.error("결제 프로세스 에러:", error);
      alert("결제 중 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="pt-16">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">결제하기</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">수업 내용을 확인하고 결제를 진행해주세요.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* 수업 정보 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">info</span>
                수업 정보
              </h2>
              <div className="flex gap-5">
                {/* 썸네일 이미지 */}
                <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-5xl">school</span>
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">PROFESSIONAL COURSE</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{tutorial.title}</h3>
                  <div className="flex flex-col gap-2 mt-4 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">person</span>
                      <span>멘토: <strong className="text-slate-900 dark:text-white">{tutorial.mentor.user.nickname}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">payments</span>
                      <span>회당 수업료: <strong className="text-slate-900 dark:text-white">₩{tutorial.price.toLocaleString()}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">schedule</span>
                      <span>수업 시간: <strong className="text-slate-900 dark:text-white">{tutorial.duration}분</strong></span>
                    </div>
                  </div>

                  {/* 수업 횟수 선택 */}
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-base">rebase_edit</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">수업 횟수 선택</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleDecrease}
                          disabled={lessonCount <= MIN_LESSON_COUNT}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 dark:bg-slate-600 text-white hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="material-symbols-outlined text-lg">remove</span>
                        </button>
                        <span className="w-10 text-center text-lg font-bold text-slate-900 dark:text-white">{lessonCount}</span>
                        <button
                          onClick={handleIncrease}
                          disabled={lessonCount >= MAX_LESSON_COUNT}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 dark:bg-slate-600 text-white hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="material-symbols-outlined text-lg">add</span>
                        </button>
                        <span className="text-sm text-slate-500 dark:text-slate-400 ml-1">회 (최대 {MAX_LESSON_COUNT}회)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 결제 수단 선택 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">credit_card</span>
                결제 수단 선택
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-3xl text-slate-600 dark:text-slate-300 mb-2">credit_card</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">신용카드</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('transfer')}
                  className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                    paymentMethod === 'transfer'
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-3xl text-slate-600 dark:text-slate-300 mb-2">account_balance</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">계좌이체</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('easy')}
                  className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                    paymentMethod === 'easy'
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-3xl text-slate-600 dark:text-slate-300 mb-2">contactless</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">간편결제</span>
                </button>
              </div>
            </div>

            {/* 할인 및 쿠폰 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">confirmation_number</span>
                할인 및 쿠폰
              </h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="쿠폰 코드를 입력하세요"
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
                <button
                  onClick={handleCouponLookup}
                  className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  쿠폰 조회
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                보유 중인 쿠폰이 2개 있습니다. [쿠폰 조회]를 클릭해 확인하세요.
              </p>
              {appliedCoupon && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-700 dark:text-green-400">
                      쿠폰 적용됨: {appliedCoupon.code}
                    </span>
                    <button
                      onClick={() => setAppliedCoupon(null)}
                      className="text-xs text-green-600 dark:text-green-400 hover:underline"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 sticky top-24 shadow-lg">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">최종 결제 금액</h2>

              <div className="space-y-4 pb-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    주문 금액 (₩{tutorial.price.toLocaleString()} × {lessonCount}회)
                  </span>
                  <span className="text-slate-900 dark:text-white font-semibold">
                    ₩{orderAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">할인 금액 (쿠폰 할인)</span>
                  <span className="text-red-500 font-semibold">
                    {couponDiscount > 0 ? `- ₩${couponDiscount.toLocaleString()}` : '- ₩0'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">포인트 사용</span>
                  <span className="text-slate-900 dark:text-white font-semibold">₩{pointUsed.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-6">
                <span className="font-bold text-slate-900 dark:text-white">총 결제 금액</span>
                <span className="text-3xl font-black text-primary">
                  ₩{totalAmount.toLocaleString()}
                </span>
              </div>

              {/* 약관 동의 */}
              <label className="flex items-start gap-3 cursor-pointer mb-5 p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-primary rounded"
                />
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  주문 내용을 확인하였으며,{' '}
                  <span className="text-primary underline cursor-pointer">개인정보 수집 및 이용</span>과{' '}
                  <span className="text-primary underline cursor-pointer">결제대행 서비스 약관</span>에 모두 동의합니다.
                </p>
              </label>

              <button
                onClick={handlePayment}
                disabled={!agreeTerms || isProcessing}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                  agreeTerms && !isProcessing
                    ? 'bg-primary text-white hover:brightness-110 shadow-lg shadow-primary/30'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isProcessing ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    결제 처리 중...
                  </>
                ) : (
                  <>
                    <span>결제 요청하기</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </button>

              <div className="mt-5 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="material-symbols-outlined text-sm mt-0.5">info</span>
                  <p>DevSolve는 안전한 결제를 위해 최선을 다하고 있습니다. 모든 결제 정보는 암호화되어 전송됩니다.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
