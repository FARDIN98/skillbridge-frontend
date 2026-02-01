'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../src/components/DashboardLayout';
import api from '../../../src/lib/api';
import { Calendar, Clock, CheckCircle, BookOpen, Star, X } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '../../../src/contexts/ToastContext';

interface Booking {
  id: string;
  dateTime: string;
  duration: number;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  subject?: string;
  notes?: string;
  createdAt: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  review?: {
    id: string;
    rating: number;
    comment: string;
  };
}

type TabType = 'pending' | 'confirmed' | 'past';

const TutorSessionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { showSuccess, showError } = useToast();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bookings');
      const allBookings: Booking[] = response.data.bookings || response.data || [];
      setBookings(allBookings);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleApprove = async (bookingId: string) => {
    setIsProcessing(true);
    try {
      await api.patch(`/bookings/${bookingId}/status`, { action: 'approve' });
      await fetchBookings();
      showSuccess('Session confirmed successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to approve booking';
      showError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedBookingId) return;

    setIsProcessing(true);
    try {
      await api.patch(`/bookings/${selectedBookingId}/status`, {
        action: 'reject',
        reason: rejectionReason.trim() || undefined
      });
      await fetchBookings();
      setRejectModalOpen(false);
      setRejectionReason('');
      setSelectedBookingId(null);
      showSuccess('Booking request declined');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reject booking';
      showError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkCompleted = async (bookingId: string) => {
    setIsProcessing(true);
    try {
      await api.patch(`/bookings/${bookingId}/status`, { action: 'complete' });
      await fetchBookings();
      showSuccess('Session marked as completed successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark session as completed';
      showError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter bookings
  const now = new Date();

  const pendingBookings = bookings.filter(
    b => b.status === 'PENDING'
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const confirmedBookings = bookings.filter(
    b => b.status === 'CONFIRMED' && new Date(b.dateTime) > now
  ).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  const pastBookings = bookings.filter(
    b => b.status === 'COMPLETED' ||
       b.status === 'CANCELLED' ||
       b.status === 'REJECTED' ||
       (b.status === 'CONFIRMED' && new Date(b.dateTime) <= now)
  ).sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

  const displayedBookings =
    activeTab === 'pending' ? pendingBookings :
    activeTab === 'confirmed' ? confirmedBookings :
    pastBookings;

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600&display=swap');

        .sessions-page {
          font-family: 'Inter', sans-serif;
        }

        .page-title {
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          color: #f1f5f9;
        }

        .tab-container {
          display: flex;
          gap: 8px;
          background: rgba(255, 255, 255, 0.03);
          padding: 6px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .tab-btn {
          flex: 1;
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          color: #cbd5e1;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .tab-btn:hover {
          color: #fbbf24;
        }

        .tab-btn.active {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: #0f172a;
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
        }

        .tab-count {
          display: inline-block;
          margin-left: 8px;
          padding: 2px 8px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 700;
          background: rgba(0, 0, 0, 0.2);
        }

        .tab-btn.active .tab-count {
          background: rgba(15, 23, 42, 0.3);
        }

        .session-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 16px;
        }

        .session-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(251, 191, 36, 0.3);
        }

        .student-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 18px;
          color: #0f172a;
          border: 2px solid rgba(251, 191, 36, 0.3);
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        .status-confirmed {
          background: rgba(34, 197, 94, 0.2);
          color: #4ade80;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .status-pending {
          background: rgba(251, 191, 36, 0.2);
          color: #fbbf24;
          border: 1px solid rgba(251, 191, 36, 0.3);
        }

        .status-completed {
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .status-cancelled {
          background: rgba(156, 163, 175, 0.2);
          color: #9ca3af;
          border: 1px solid rgba(156, 163, 175, 0.3);
        }

        .status-rejected {
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .approve-btn {
          padding: 10px 18px;
          border-radius: 10px;
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          color: white;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .approve-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
        }

        .approve-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .reject-btn {
          padding: 10px 18px;
          border-radius: 10px;
          background: rgba(239, 68, 68, 0.1);
          border: 2px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .reject-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          transform: translateY(-2px);
        }

        .reject-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .complete-btn {
          padding: 10px 18px;
          border-radius: 10px;
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          color: white;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .complete-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #cbd5e1;
          font-size: 13px;
        }

        .review-display {
          margin-top: 16px;
          padding: 16px;
          border-radius: 12px;
          background: rgba(251, 191, 36, 0.05);
          border: 1px solid rgba(251, 191, 36, 0.2);
        }

        .star-rating {
          display: flex;
          gap: 2px;
        }

        .empty-state {
          text-align: center;
          padding: 64px 24px;
        }

        .empty-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 16px;
          border-radius: 50%;
          background: rgba(251, 191, 36, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fbbf24;
        }

        .loading-shimmer {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.03) 0%,
            rgba(255, 255, 255, 0.08) 50%,
            rgba(255, 255, 255, 0.03) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .student-message {
          margin-top: 12px;
          padding: 12px;
          border-radius: 10px;
          background: rgba(251, 191, 36, 0.05);
          border: 1px solid rgba(251, 191, 36, 0.2);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
        }

        .modal-content {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 24px;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        .modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 12px;
        }

        .modal-description {
          color: #cbd5e1;
          font-size: 14px;
          margin-bottom: 20px;
        }

        .modal-textarea {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 14px;
          resize: vertical;
          min-height: 100px;
          margin-bottom: 20px;
        }

        .modal-textarea:focus {
          outline: none;
          border-color: #fbbf24;
          background: rgba(255, 255, 255, 0.08);
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .modal-cancel-btn {
          padding: 10px 18px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #cbd5e1;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .modal-cancel-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .modal-confirm-btn {
          padding: 10px 18px;
          border-radius: 10px;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          border: none;
          color: white;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .modal-confirm-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
        }

        .modal-confirm-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>

      <DashboardLayout allowedRoles={['TUTOR']}>
        <div className="sessions-page">
          {/* Header */}
          <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
            <h1 className="page-title text-3xl md:text-4xl mb-2">Sessions</h1>
            <p className="text-slate-400 text-sm md:text-base">
              Manage your tutoring sessions with students
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
            <div className="tab-container max-w-2xl">
              <button
                className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                onClick={() => setActiveTab('pending')}
              >
                Pending Requests
                <span className="tab-count">{pendingBookings.length}</span>
              </button>
              <button
                className={`tab-btn ${activeTab === 'confirmed' ? 'active' : ''}`}
                onClick={() => setActiveTab('confirmed')}
              >
                Confirmed Sessions
                <span className="tab-count">{confirmedBookings.length}</span>
              </button>
              <button
                className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
                onClick={() => setActiveTab('past')}
              >
                Past Sessions
                <span className="tab-count">{pastBookings.length}</span>
              </button>
            </div>
          </div>

          {/* Sessions List */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="loading-shimmer rounded-xl"
                  style={{ height: '180px' }}
                />
              ))}
            </div>
          ) : displayedBookings.length === 0 ? (
            <div className="empty-state animate-fade-in-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
              <div className="empty-icon">
                <BookOpen className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {activeTab === 'pending' ? 'No Pending Requests' :
                 activeTab === 'confirmed' ? 'No Confirmed Sessions' :
                 'No Past Sessions'}
              </h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                {activeTab === 'pending'
                  ? "You don't have any pending booking requests. Students can request sessions from your profile page."
                  : activeTab === 'confirmed'
                  ? "You don't have any confirmed sessions. Approved bookings will appear here."
                  : "You haven't completed any sessions yet. Your past sessions will appear here."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedBookings.map((booking, index) => (
                <div
                  key={booking.id}
                  className="session-card animate-fade-in-up"
                  style={{ animationDelay: `${0.3 + index * 0.05}s`, opacity: 0 }}
                >
                  <div className="flex flex-col gap-4">
                    {/* Header: Student Info & Status */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="student-avatar flex-shrink-0">
                          {booking.student.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold text-base truncate">
                            {booking.student.name}
                          </h3>
                          <p className="text-slate-400 text-xs truncate">{booking.student.email}</p>
                        </div>
                      </div>
                      <span className={`status-badge ${
                        booking.status === 'CONFIRMED' ? 'status-confirmed' :
                        booking.status === 'PENDING' ? 'status-pending' :
                        booking.status === 'REJECTED' ? 'status-rejected' :
                        booking.status === 'COMPLETED' ? 'status-completed' :
                        'status-cancelled'
                      }`}>
                        {booking.status}
                      </span>
                    </div>

                    {/* Session Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="info-item">
                        <Calendar className="h-4 w-4 text-amber-400 flex-shrink-0" />
                        <span>{format(new Date(booking.dateTime), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="info-item">
                        <Clock className="h-4 w-4 text-amber-400 flex-shrink-0" />
                        <span>{format(new Date(booking.dateTime), 'hh:mm a')}</span>
                      </div>
                      <div className="info-item">
                        <Clock className="h-4 w-4 text-amber-400 flex-shrink-0" />
                        <span>{booking.duration} minutes</span>
                      </div>
                    </div>

                    {/* Subject */}
                    {booking.subject && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-sm">Subject:</span>
                        <span className="px-3 py-1 rounded-lg text-sm font-medium bg-amber-400/10 text-amber-400 border border-amber-400/20">
                          {booking.subject}
                        </span>
                      </div>
                    )}

                    {/* Student's Message (PENDING status) */}
                    {booking.status === 'PENDING' && booking.notes && !booking.notes.includes('[REJECTION REASON]') && (
                      <div className="student-message">
                        <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">Student&apos;s Message:</p>
                        <p className="text-slate-300 text-sm">{booking.notes.replace('Booking during available slot', 'Requested during available time slot')}</p>
                      </div>
                    )}

                    {/* Approve/Reject Actions for PENDING */}
                    {booking.status === 'PENDING' && (
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => handleApprove(booking.id)}
                          disabled={isProcessing}
                          className="approve-btn"
                        >
                          <CheckCircle size={16} />
                          Approve & Confirm
                        </button>
                        <button
                          onClick={() => handleReject(booking.id)}
                          disabled={isProcessing}
                          className="reject-btn"
                        >
                          <X size={16} />
                          Reject Request
                        </button>
                      </div>
                    )}

                    {/* Review Display (if exists) */}
                    {booking.review && (
                      <div className="review-display">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="star-rating">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < booking.review!.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-amber-400 text-sm font-semibold">
                            {booking.review.rating}/5
                          </span>
                        </div>
                        <p className="text-slate-300 text-sm">{booking.review.comment}</p>
                      </div>
                    )}

                    {/* Mark as Completed (for CONFIRMED past sessions) */}
                    {activeTab === 'past' && booking.status === 'CONFIRMED' && new Date(booking.dateTime) <= now && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleMarkCompleted(booking.id)}
                          disabled={isProcessing}
                          className="complete-btn"
                        >
                          <CheckCircle size={16} />
                          Mark as Completed
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>

      {/* Rejection Reason Modal */}
      {rejectModalOpen && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setRejectModalOpen(false);
            setRejectionReason('');
            setSelectedBookingId(null);
          }
        }}>
          <div className="modal-content">
            <h2 className="modal-title">Reject Booking Request</h2>
            <p className="modal-description">
              Optionally provide a reason for rejecting this booking request. The student will see this message.
            </p>
            <textarea
              className="modal-textarea"
              placeholder="Reason for rejection (optional)..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              disabled={isProcessing}
            />
            <div className="modal-actions">
              <button
                className="modal-cancel-btn"
                onClick={() => {
                  setRejectModalOpen(false);
                  setRejectionReason('');
                  setSelectedBookingId(null);
                }}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                className="modal-confirm-btn"
                onClick={handleRejectConfirm}
                disabled={isProcessing}
              >
                {isProcessing ? 'Rejecting...' : 'Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TutorSessionsPage;
