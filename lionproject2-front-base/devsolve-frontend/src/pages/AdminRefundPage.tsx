import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import * as paymentApi from '@/api/payment';
import type { PaymentStatus, RefundRequestItem } from '@/api/payment';

function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
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
    case 'REFUND_REQUESTED':
      return (
        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold px-3 py-1 rounded-full">
          환불요청
        </span>
      );
    case 'REFUNDED':
      return (
        <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-3 py-1 rounded-full">
          환불완료
        </span>
      );
    case 'REFUND_REJECTED':
      return (
        <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-3 py-1 rounded-full">
          환불거절
        </span>
      );
    case 'PAID':
      return (
        <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full">
          결제완료
        </span>
      );
    default:
      return (
        <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-3 py-1 rounded-full">
          -
        </span>
      );
  }
}

export default function AdminRefundPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState<RefundRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!authLoading && isAuthenticated) {
      fetchRequests();
    }
  }, [authLoading, isAuthenticated, navigate]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await paymentApi.getRefundRequests();
      if (res.success && res.data) {
        setRequests(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch refund requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (paymentId: number) => {
    if (!confirm('해당 환불 요청을 승인할까요?')) return;
    setProcessingId(paymentId);
    try {
      const res = await paymentApi.approveRefund(paymentId);
      if (res.success) {
        await fetchRequests();
      } else {
        alert('환불 승인에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to approve refund:', error);
      alert('환불 승인 중 오류가 발생했습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (paymentId: number) => {
    if (!confirm('해당 환불 요청을 거절할까요?')) return;
    setProcessingId(paymentId);
    try {
      const res = await paymentApi.rejectRefund(paymentId);
      if (res.success) {
        await fetchRequests();
      } else {
        alert('환불 거절에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to reject refund:', error);
      alert('환불 거절 중 오류가 발생했습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="pt-16">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">환불 요청 관리</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              멘티가 신청한 환불 요청을 확인하고 처리하세요.
            </p>
          </div>
          <button
            onClick={fetchRequests}
            className="text-primary hover:underline text-sm font-medium flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            새로고침
          </button>
        </div>

        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.paymentId}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-2xl">receipt_long</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusBadge(request.status)}
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">
                      {request.tutorialTitle}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500 dark:text-slate-400">
                      <span>멘토: {request.mentorName}</span>
                      <span>·</span>
                      <span>결제일: {formatDate(request.paidAt || request.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 md:flex-col md:items-end">
                  <p className="text-xl font-bold text-primary">
                    \{request.amount.toLocaleString()}
                  </p>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => handleApprove(request.paymentId)}
                      disabled={processingId === request.paymentId}
                      className="text-xs text-green-600 hover:underline disabled:opacity-50"
                    >
                      {processingId === request.paymentId ? '처리중...' : '승인'}
                    </button>
                    <button
                      onClick={() => handleReject(request.paymentId)}
                      disabled={processingId === request.paymentId}
                      className="text-xs text-red-600 hover:underline disabled:opacity-50"
                    >
                      {processingId === request.paymentId ? '처리중...' : '거절'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {requests.length === 0 && (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">
              assignment_turned_in
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              대기 중인 환불 요청이 없습니다
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              새로운 환불 요청이 접수되면 이곳에서 처리할 수 있습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
