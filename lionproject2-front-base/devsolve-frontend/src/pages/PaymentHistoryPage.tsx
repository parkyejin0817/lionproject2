import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import * as paymentApi from '@/api/payment';
import type { PaymentHistory, PaymentStatus } from '@/api/payment';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusBadge(status: PaymentStatus) {
  switch (status) {
    case 'PAID':
      return (
        <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full">
          결제완료
        </span>
      );
    case 'PENDING':
      return (
        <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 text-xs font-bold px-3 py-1 rounded-full">
          결제대기
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-3 py-1 rounded-full">
          환불완료
        </span>
      );
    default:
      return null;
  }
}

export default function PaymentHistoryPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'cancelled'>('all');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!authLoading && isAuthenticated) {
      fetchPayments();
    }
  }, [authLoading, isAuthenticated, navigate]);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const res = await paymentApi.getMyPayments();
      if (res.success && res.data) {
        setPayments(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    );
  }

  const filteredPayments = payments.filter((payment) => {
    if (filter === 'all') return true;
    if (filter === 'paid') return payment.status === 'PAID';
    if (filter === 'cancelled') return payment.status === 'CANCELLED';
    return true;
  });

  const totalPaid = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalRefunded = payments
    .filter((p) => p.status === 'CANCELLED')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="pt-16">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">결제 내역</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              수업 신청 및 결제 내역을 확인하세요
            </p>
          </div>
          <Link
            to="/mypage"
            className="text-primary hover:underline text-sm font-medium flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            마이페이지로 돌아가기
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600">payments</span>
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">총 결제</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              ₩{totalPaid.toLocaleString()}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-600">currency_exchange</span>
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">환불</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              ₩{totalRefunded.toLocaleString()}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600">school</span>
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">총 결제 건수</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {payments.length}건
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: '전체' },
            { key: 'paid', label: '결제완료' },
            { key: 'cancelled', label: '환불' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as typeof filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === key
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary/10 hover:text-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Payment List */}
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <div
              key={payment.id}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-2xl">school</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusBadge(payment.status)}
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">
                      {payment.tutorialTitle}
                    </h3>
                    <div className="flex items-center gap-3 mt-2 text-sm text-slate-500 dark:text-slate-400">
                      <span>{payment.paymentMethod}</span>
                      <span>·</span>
                      <span>{formatDate(payment.paidAt || payment.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 md:flex-col md:items-end">
                  <p className={`text-xl font-bold ${
                    payment.status === 'CANCELLED'
                      ? 'text-red-600 dark:text-red-400 line-through'
                      : 'text-primary'
                  }`}>
                    ₩{payment.amount.toLocaleString()}
                  </p>
                  <div className="flex gap-2">
                    <Link
                      to={`/tutorial/${payment.tutorialId}`}
                      className="text-xs text-primary hover:underline"
                    >
                      상세보기
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPayments.length === 0 && (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">
              receipt_long
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              결제 내역이 없습니다
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              멘토를 찾아 수업을 신청해보세요!
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
      </div>
    </div>
  );
}
