'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../src/components/DashboardLayout';
import api from '../../../src/lib/api';
import { Calendar, Clock, CheckCircle, BookOpen, Star } from 'lucide-react';
import { format } from 'date-fns';

interface Booking {
  id: string;
  dateTime: string;
  duration: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
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

type TabType = 'upcoming' | 'past';

const TutorSessionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleMarkCompleted = async (bookingId: string) => {
    if (confirm('Mark this session as completed?')) {
      try {
        await api.patch(`/bookings/${bookingId}/status`, { status: 'COMPLETED' });
        await fetchBookings();
      } catch (error: any) {
        alert(error.message || 'Failed to mark session as completed');
      }
    }
  };

  // Filter bookings
  const now = new Date();
  const upcomingBookings = bookings.filter(
    b => (b.status === 'CONFIRMED' || b.status === 'PENDING') && new Date(b.dateTime) > now
  ).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  const pastBookings = bookings.filter(
    b => b.status === 'COMPLETED' || b.status === 'CANCELLED' ||
    ((b.status === 'CONFIRMED' || b.status === 'PENDING') && new Date(b.dateTime) <= now)
  ).sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

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
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.3);
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
            <div className="tab-container max-w-md">
              <button
                className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
                onClick={() => setActiveTab('upcoming')}
              >
                Upcoming
                <span className="tab-count">{upcomingBookings.length}</span>
              </button>
              <button
                className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
                onClick={() => setActiveTab('past')}
              >
                Past
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
                {activeTab === 'upcoming' ? 'No Upcoming Sessions' : 'No Past Sessions'}
              </h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                {activeTab === 'upcoming'
                  ? "You don't have any upcoming sessions. Students will be able to book sessions once your profile is complete."
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
                      <span className={`status-badge ${booking.status === 'CONFIRMED' ? 'status-confirmed' : booking.status === 'PENDING' ? 'status-pending' : booking.status === 'COMPLETED' ? 'status-completed' : 'status-cancelled'}`}>
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

                    {/* Actions */}
                    {activeTab === 'upcoming' && booking.status === 'CONFIRMED' && new Date(booking.dateTime) <= now && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleMarkCompleted(booking.id)}
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
    </>
  );
};

export default TutorSessionsPage;
