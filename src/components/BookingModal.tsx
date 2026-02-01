'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, DollarSign, User } from 'lucide-react';
import { format, addDays, setHours, setMinutes } from 'date-fns';
import api from '../lib/api';
import Button from './Button';
import { ButtonSpinner } from './ButtonSpinner';

interface Tutor {
  id: string;
  name: string;
  tutorProfile?: {
    hourlyRate: number;
    subjects: string[];
    availability?: string[];
  };
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutor: Tutor;
  onBookingSuccess?: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  tutor,
  onBookingSuccess
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [duration, setDuration] = useState<number>(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(new Date());
      setSelectedTime('');
      setDuration(60);
      setError('');
    }
  }, [isOpen]);

  // Generate available dates (next 14 days)
  const availableDates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i + 1));

  // Generate time slots (9 AM to 8 PM)
  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = 9 + i;
    return {
      value: `${hour.toString().padStart(2, '0')}:00`,
      label: format(setHours(setMinutes(new Date(), 0), hour), 'h:mm a')
    };
  });

  // Calculate total price
  const hourlyRate = tutor.tutorProfile?.hourlyRate || 0;
  const totalPrice = (hourlyRate * duration) / 60;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedTime) {
      setError('Please select a time slot');
      return;
    }

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const dateTime = setHours(setMinutes(selectedDate, minutes), hours);

    setIsSubmitting(true);

    try {
      await api.post('/bookings', {
        tutorId: tutor.id,
        dateTime: dateTime.toISOString(),
        duration
      });

      onBookingSuccess?.();
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create booking';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container - Full screen on mobile, centered modal on desktop */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center sm:p-4">
          {/* Modal Content */}
          <div
            className="relative w-full h-full sm:h-auto sm:max-w-2xl bg-gradient-to-br from-slate-900 to-slate-950 sm:rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-slate-900 font-bold text-lg flex-shrink-0">
                    {tutor.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-white truncate">
                      Book Session with {tutor.name}
                    </h2>
                    <p className="text-sm text-slate-400">
                      ${hourlyRate}/hour
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="ml-2 p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Close modal"
                >
                  <X className="h-6 w-6 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 pb-24 sm:pb-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Date Selection */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Calendar className="h-5 w-5 text-amber-400" />
                  Select Date
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {availableDates.slice(0, 6).map((date) => (
                    <button
                      key={date.toISOString()}
                      type="button"
                      onClick={() => setSelectedDate(date)}
                      className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 min-h-[60px] sm:min-h-[70px] ${
                        selectedDate.toDateString() === date.toDateString()
                          ? 'bg-amber-400/20 border-amber-400 text-amber-400'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="text-xs sm:text-sm font-medium">
                        {format(date, 'EEE')}
                      </div>
                      <div className="text-base sm:text-lg font-bold mt-1">
                        {format(date, 'MMM d')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Clock className="h-5 w-5 text-amber-400" />
                  Select Time
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.value}
                      type="button"
                      onClick={() => setSelectedTime(slot.value)}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium min-h-[44px] ${
                        selectedTime === slot.value
                          ? 'bg-amber-400/20 border-amber-400 text-amber-400'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Selection */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Clock className="h-5 w-5 text-amber-400" />
                  Session Duration
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {[30, 60, 90, 120].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDuration(mins)}
                      className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 min-h-[60px] ${
                        duration === mins
                          ? 'bg-amber-400/20 border-amber-400 text-amber-400'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="text-lg sm:text-xl font-bold">{mins}</div>
                      <div className="text-xs font-medium mt-1">minutes</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-400 text-sm">Hourly Rate</span>
                  <span className="text-white font-semibold">${hourlyRate}/hr</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-400 text-sm">Duration</span>
                  <span className="text-white font-semibold">{duration} minutes</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                  <span className="text-white font-semibold flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-amber-400" />
                    Total Price
                  </span>
                  <span className="text-2xl font-bold text-amber-400">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Subjects */}
              {tutor.tutorProfile?.subjects && tutor.tutorProfile.subjects.length > 0 && (
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-white">
                    <User className="h-5 w-5 text-amber-400" />
                    Available Subjects
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tutor.tutorProfile.subjects.map((subject, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded-full text-xs font-medium"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </form>

            {/* Fixed Bottom Actions - Full width on mobile */}
            <div className="fixed sm:sticky bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 bg-white/5 border-2 border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px]"
                >
                  Cancel
                </button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !selectedTime}
                  variant="primary"
                  className="flex-1 min-h-[56px] text-base font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <ButtonSpinner light />
                      <span>Booking...</span>
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingModal;
