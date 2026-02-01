'use client';

import React, { useState } from 'react';
import { Calendar, Clock, DollarSign, X, Star } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '../contexts/ToastContext';

interface Booking {
  id: string;
  dateTime: string;
  duration: number;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  subject?: string;
  notes?: string;
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
  const { showWarning } = useToast();

  const handleCancel = async () => {
    if (!onCancel) return;

    const bookingDate = new Date(booking.dateTime);
    const now = new Date();
    const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // For confirmed bookings, check 24 hour window
    if (booking.status === 'CONFIRMED' && hoursUntilBooking < 24) {
      showWarning('Cannot cancel confirmed bookings within 24 hours of the scheduled time.');
      return;
    }

    const confirmMessage = booking.status === 'PENDING'
      ? 'Are you sure you want to cancel this booking request?'
      : 'Are you sure you want to cancel this booking?';

    if (confirm(confirmMessage)) {
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

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'PENDING':
        return 'bg-amber-400/20 text-amber-400 border border-amber-400/30';
      case 'REJECTED':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'COMPLETED':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'CANCELLED':
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
      default:
        return 'bg-amber-400/20 text-amber-400 border border-amber-400/30';
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
      <div className="bg-white/3 backdrop-blur-2xl border border-white/10 rounded-xl p-4 md:p-6 transition-all duration-300 hover:bg-white/5 hover:border-amber-400/30">
        <div className="flex flex-col gap-4">
          {/* Header: Tutor Info & Status */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center font-bold text-lg text-slate-900 border-2 border-amber-400/30 shrink-0">
                {booking.tutor.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-base truncate">
                  {booking.tutor.name}
                </h3>
                <p className="text-slate-400 text-xs truncate">{booking.tutor.email}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap ${getStatusBadgeClasses(booking.status)}`}>
              {booking.status}
            </span>
          </div>

          {/* Booking Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 text-slate-300 text-sm">
              <Calendar className="h-4 w-4 text-amber-400 shrink-0" />
              <span>{format(new Date(booking.dateTime), 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 text-sm">
              <Clock className="h-4 w-4 text-amber-400 shrink-0" />
              <span>{format(new Date(booking.dateTime), 'hh:mm a')}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 text-sm">
              <Clock className="h-4 w-4 text-amber-400 shrink-0" />
              <span>{booking.duration} minutes</span>
            </div>
            {totalPrice > 0 && (
              <div className="flex items-center gap-2 text-slate-300 text-sm">
                <DollarSign className="h-4 w-4 text-amber-400 shrink-0" />
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            )}
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
            <div className="p-3 rounded-xl bg-amber-400/5 border border-amber-400/20">
              <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">Your Message:</p>
              <p className="text-slate-300 text-sm">{booking.notes.replace('Booking during available slot', 'Requested during available time slot')}</p>
            </div>
          )}

          {/* Rejection Reason (REJECTED status) */}
          {booking.status === 'REJECTED' && booking.notes && booking.notes.includes('[REJECTION REASON]') && (
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20">
              <p className="text-red-400 text-xs font-semibold uppercase tracking-wider mb-1">Rejection Reason:</p>
              <p className="text-slate-300 text-sm">
                {booking.notes.split('[REJECTION REASON]')[1]?.trim() || 'No reason provided'}
              </p>
            </div>
          )}

          {/* Subjects */}
          {booking.tutor.tutorProfile?.subjects && booking.tutor.tutorProfile.subjects.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {booking.tutor.tutorProfile.subjects.slice(0, 4).map((subject, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  {subject}
                </span>
              ))}
              {booking.tutor.tutorProfile.subjects.length > 4 && (
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  +{booking.tutor.tutorProfile.subjects.length - 4} more
                </span>
              )}
            </div>
          )}

          {/* Review Display (if exists) */}
          {booking.review && (
            <div className="mt-3 p-3 rounded-xl bg-amber-400/5 border border-amber-400/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-0.5">
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
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 border inline-flex items-center gap-2 bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                >
                  <X className="h-4 w-4" />
                  {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              )}
              {canReview && (
                <button
                  onClick={handleReview}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-400/30 min-h-[44px]"
                >
                  <Star className="h-4 w-4" />
                  Leave Review
                </button>
              )}
            </div>
          )}
        </div>
      </div>
  );
};

export default BookingCard;
