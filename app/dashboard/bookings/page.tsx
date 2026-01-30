'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../src/components/DashboardLayout';
import BookingCard from '../../../src/components/BookingCard';
import ReviewModal from '../../../src/components/ReviewModal';
import api from '../../../src/lib/api';
import { BookOpen } from 'lucide-react';

interface Booking {
  id: string;
  dateTime: string;
  duration: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  tutor: {
    id: string;
    name: string;
    email: string;
    tutorProfile?: {
      hourlyRate: number;
      subjects: string[];
    };
  };
  review?: {
    id: string;
    rating: number;
    comment: string;
  };
}

type TabType = 'upcoming' | 'past';

const BookingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

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

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status: 'CANCELLED' });
      // Refresh bookings
      await fetchBookings();
    } catch (error: any) {
      alert(error.message || 'Failed to cancel booking');
      throw error;
    }
  };

  const handleOpenReviewModal = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      setSelectedBooking(booking);
      setReviewModalOpen(true);
    }
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!selectedBooking) return;

    try {
      await api.post('/reviews', {
        bookingId: selectedBooking.id,
        tutorId: selectedBooking.tutor.id,
        rating,
        comment
      });

      // Refresh bookings to show the new review
      await fetchBookings();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to submit review');
    }
  };

  // Filter bookings based on active tab
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

        .bookings-page {
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
          position: relative;
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

      <DashboardLayout allowedRoles={['STUDENT']}>
        <div className="bookings-page">
          {/* Header */}
          <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
            <h1 className="page-title text-3xl md:text-4xl mb-2">My Bookings</h1>
            <p className="text-slate-400 text-sm md:text-base">
              View and manage your tutoring sessions
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

          {/* Bookings List */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="loading-shimmer rounded-xl"
                  style={{ height: '200px' }}
                />
              ))}
            </div>
          ) : displayedBookings.length === 0 ? (
            <div className="empty-state animate-fade-in-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
              <div className="empty-icon">
                <BookOpen className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {activeTab === 'upcoming' ? 'No Upcoming Bookings' : 'No Past Bookings'}
              </h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                {activeTab === 'upcoming'
                  ? "You don't have any upcoming sessions. Browse tutors to book your first session!"
                  : "You haven't completed any sessions yet. Your past bookings will appear here."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedBookings.map((booking, index) => (
                <div
                  key={booking.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${0.3 + index * 0.05}s`, opacity: 0 }}
                >
                  <BookingCard
                    booking={booking}
                    onCancel={handleCancelBooking}
                    onReview={handleOpenReviewModal}
                    showActions={true}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>

      {/* Review Modal */}
      {selectedBooking && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedBooking(null);
          }}
          onSubmit={handleSubmitReview}
          tutorName={selectedBooking.tutor.name}
          bookingId={selectedBooking.id}
        />
      )}
    </>
  );
};

export default BookingsPage;
