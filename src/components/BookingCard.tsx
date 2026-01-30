'use client';

import React, { useState } from 'react';
import { Calendar, Clock, DollarSign, X, Star } from 'lucide-react';
import { format } from 'date-fns';

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

interface BookingCardProps {
  booking: Booking;
  onCancel?: (bookingId: string) => void;
  onReview?: (bookingId: string) => void;
  showActions?: boolean;
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onCancel,
  onReview,
  showActions = true
}) => {
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    if (!onCancel) return;

    // Check if booking is within 24 hours
    const bookingDate = new Date(booking.dateTime);
    const now = new Date();
    const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilBooking < 24) {
      alert('Cannot cancel bookings within 24 hours of the scheduled time.');
      return;
    }

    if (confirm('Are you sure you want to cancel this booking?')) {
      setIsCancelling(true);
      try {
        await onCancel(booking.id);
      } catch (error) {
        console.error('Failed to cancel booking:', error);
      } finally {
        setIsCancelling(false);
      }
    }
  };

  const handleReview = () => {
    if (onReview) {
      onReview(booking.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'status-confirmed';
      case 'PENDING':
        return 'status-pending';
      case 'COMPLETED':
        return 'status-completed';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  const canCancel = showActions &&
    (booking.status === 'CONFIRMED' || booking.status === 'PENDING') &&
    new Date(booking.dateTime) > new Date();

  const canReview = showActions &&
    booking.status === 'COMPLETED' &&
    !booking.review;

  const totalPrice = booking.tutor.tutorProfile?.hourlyRate
    ? (booking.tutor.tutorProfile.hourlyRate * booking.duration) / 60
    : 0;

  return (
    <>
      <style jsx>{`
        .booking-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .booking-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(251, 191, 36, 0.3);
        }

        .tutor-avatar {
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
          font-size: 11px;
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

        .subject-tag {
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 500;
          background: rgba(251, 191, 36, 0.1);
          color: #fbbf24;
          border: 1px solid rgba(251, 191, 36, 0.2);
        }

        .action-btn {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .cancel-btn {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .cancel-btn:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.2);
          transform: translateY(-1px);
        }

        .cancel-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .review-btn {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: #0f172a;
        }

        .review-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #cbd5e1;
          font-size: 13px;
        }

        .review-display {
          margin-top: 12px;
          padding: 12px;
          border-radius: 12px;
          background: rgba(251, 191, 36, 0.05);
          border: 1px solid rgba(251, 191, 36, 0.2);
        }

        .star-rating {
          display: flex;
          gap: 2px;
        }
      `}</style>

      <div className="booking-card rounded-xl p-4 md:p-6">
        <div className="flex flex-col gap-4">
          {/* Header: Tutor Info & Status */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="tutor-avatar flex-shrink-0">
                {booking.tutor.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-base truncate">
                  {booking.tutor.name}
                </h3>
                <p className="text-slate-400 text-xs truncate">{booking.tutor.email}</p>
              </div>
            </div>
            <span className={`status-badge ${getStatusColor(booking.status)}`}>
              {booking.status}
            </span>
          </div>

          {/* Booking Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
            {totalPrice > 0 && (
              <div className="info-item">
                <DollarSign className="h-4 w-4 text-amber-400 flex-shrink-0" />
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Subjects */}
          {booking.tutor.tutorProfile?.subjects && booking.tutor.tutorProfile.subjects.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {booking.tutor.tutorProfile.subjects.slice(0, 4).map((subject, idx) => (
                <span key={idx} className="subject-tag">
                  {subject}
                </span>
              ))}
              {booking.tutor.tutorProfile.subjects.length > 4 && (
                <span className="subject-tag">
                  +{booking.tutor.tutorProfile.subjects.length - 4} more
                </span>
              )}
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

          {/* Actions */}
          {showActions && (canCancel || canReview) && (
            <div className="flex flex-wrap gap-3 pt-2">
              {canCancel && (
                <button
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="cancel-btn action-btn"
                >
                  <X className="h-4 w-4" />
                  {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              )}
              {canReview && (
                <button onClick={handleReview} className="review-btn action-btn">
                  <Star className="h-4 w-4" />
                  Leave Review
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BookingCard;
