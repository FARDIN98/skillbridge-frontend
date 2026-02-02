'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar, Clock, User, MessageSquare } from 'lucide-react';
import { format, addDays, setHours, setMinutes } from 'date-fns';
import api from '../lib/api';
import Button from './Button';
import { ButtonSpinner } from './ButtonSpinner';
import { generateAvailableSlots, groupSlotsByDate, type AvailabilitySlot } from '../utils/availability';

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

type BookingMode = 'available' | 'custom';

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  tutor,
  onBookingSuccess
}) => {
  // Booking mode state
  const [bookingMode, setBookingMode] = useState<BookingMode>('available');

  // Available slot selection
  const [selectedAvailableSlot, setSelectedAvailableSlot] = useState<AvailabilitySlot | null>(null);

  // Custom request state
  const [customDate, setCustomDate] = useState<Date>(new Date());
  const [customTime, setCustomTime] = useState<string>('');
  const [customSubject, setCustomSubject] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');

  // Shared state
  const [duration, setDuration] = useState<number>(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setBookingMode('available');
      setSelectedAvailableSlot(null);
      setCustomDate(new Date());
      setCustomTime('');
      setCustomSubject('');
      setCustomMessage('');
      setDuration(60);
      setError('');
    }
  }, [isOpen]);

  // Generate available slots from tutor's availability
  const availableSlots = useMemo(() => {
    const availabilityStrings = tutor.tutorProfile?.availability || [];
    return generateAvailableSlots(availabilityStrings, 14);
  }, [tutor.tutorProfile?.availability]);

  // Group slots by date for display
  const slotsByDate = useMemo(() => {
    return groupSlotsByDate(availableSlots);
  }, [availableSlots]);

  // Get unique dates that have availability
  const datesWithAvailability = useMemo(() => {
    return Array.from(slotsByDate.keys())
      .sort()
      .slice(0, 7); // Show first 7 days that have availability
  }, [slotsByDate]);

  // Generate dates for custom request (starting from today, next 14 days)
  const customRequestDates = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));
  }, []);

  // Generate time slots for custom request (9 AM to 8 PM)
  const customTimeSlots = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const hour = 9 + i;
      const time = `${hour.toString().padStart(2, '0')}:00`;
      return {
        value: time,
        label: format(setHours(setMinutes(new Date(), 0), hour), 'h:mm a')
      };
    });
  }, []);

  // Calculate total price
  const hourlyRate = tutor.tutorProfile?.hourlyRate || 0;
  const totalPrice = (hourlyRate * duration) / 60;

  // Get subjects for dropdown
  const subjects = tutor.tutorProfile?.subjects || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let dateTime: Date;
    let subject: string = '';
    let notes: string = '';

    if (bookingMode === 'available') {
      // Available slot booking
      if (!selectedAvailableSlot) {
        setError('Please select an available time slot');
        return;
      }
      dateTime = selectedAvailableSlot.date;
      subject = subjects[0] || ''; // Auto-select first subject or empty
      notes = 'Booking during available slot';
    } else {
      // Custom request booking
      if (!customTime) {
        setError('Please select a time');
        return;
      }
      if (!customSubject) {
        setError('Please select a subject');
        return;
      }
      if (!customMessage || customMessage.trim().length < 10) {
        setError('Please provide a message (at least 10 characters)');
        return;
      }

      const [hours, minutes] = customTime.split(':').map(Number);
      dateTime = setHours(setMinutes(customDate, minutes), hours);
      subject = customSubject;
      notes = customMessage;
    }

    setIsSubmitting(true);

    try {
      await api.post('/bookings', {
        tutorId: tutor.id,
        dateTime: dateTime.toISOString(),
        duration,
        subject,
        notes
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

              {/* Mode Toggle */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setBookingMode('available')}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                    bookingMode === 'available'
                      ? 'bg-amber-400 text-slate-900'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  Available Times
                </button>
                <button
                  type="button"
                  onClick={() => setBookingMode('custom')}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                    bookingMode === 'custom'
                      ? 'bg-amber-400 text-slate-900'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  Request Custom Time
                </button>
              </div>

              {/* Section 1: Available Times */}
              {bookingMode === 'available' && (
                <div className="space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/30 text-blue-400 px-4 py-3 rounded-xl text-sm">
                    📅 Book during the tutor&apos;s available hours
                  </div>

                  {availableSlots.length === 0 ? (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                      <Clock className="h-12 w-12 text-slate-500 mx-auto mb-3" />
                      <p className="text-slate-400">
                        No available time slots set by tutor.
                      </p>
                      <p className="text-slate-500 text-sm mt-2">
                        Try requesting a custom time instead.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {datesWithAvailability.map((dateKey) => {
                        const slots = slotsByDate.get(dateKey) || [];
                        if (slots.length === 0) return null;

                        return (
                          <div key={dateKey} className="space-y-2">
                            <h3 className="text-white font-semibold text-sm">
                              {slots[0].displayDate}
                            </h3>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                              {slots.map((slot, idx) => (
                                <button
                                  key={`${dateKey}-${idx}`}
                                  type="button"
                                  onClick={() => setSelectedAvailableSlot(slot)}
                                  className={`p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                                    selectedAvailableSlot?.date.getTime() === slot.date.getTime()
                                      ? 'bg-amber-400/20 border-amber-400 text-amber-400'
                                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                                  }`}
                                >
                                  {slot.displayTime}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Section 2: Custom Request */}
              {bookingMode === 'custom' && (
                <div className="space-y-4">
                  <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-3 rounded-xl text-sm">
                    🕐 Need a different time? Send a request to the tutor
                  </div>

                  {/* Date Selection */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-white">
                      <Calendar className="h-5 w-5 text-amber-400" />
                      Select Date
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                      {customRequestDates.slice(0, 6).map((date) => (
                        <button
                          key={date.toISOString()}
                          type="button"
                          onClick={() => setCustomDate(date)}
                          className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 min-h-[60px] sm:min-h-[70px] ${
                            customDate.toDateString() === date.toDateString()
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
                      {customTimeSlots.map((slot) => (
                        <button
                          key={slot.value}
                          type="button"
                          onClick={() => setCustomTime(slot.value)}
                          className={`p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium min-h-[44px] ${
                            customTime === slot.value
                              ? 'bg-amber-400/20 border-amber-400 text-amber-400'
                              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                          }`}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subject Selection */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-white">
                      <User className="h-5 w-5 text-amber-400" />
                      Subject *
                    </label>
                    <select
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-400 transition-colors"
                    >
                      <option value="" className="bg-slate-900">Select a subject</option>
                      {subjects.map((subject, idx) => (
                        <option key={idx} value={subject} className="bg-slate-900">
                          {subject}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message/Justification */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-white">
                      <MessageSquare className="h-5 w-5 text-amber-400" />
                      Message (Required) *
                    </label>
                    <textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Why do you need this specific time? (min 10 characters)"
                      rows={4}
                      className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors resize-none"
                    />
                    <p className="text-xs text-slate-500">
                      {customMessage.length} / 10 minimum characters
                    </p>
                  </div>
                </div>
              )}

              {/* Duration Selection (Common) */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Clock className="h-5 w-5 text-amber-400" />
                  Session Duration
                </label>
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
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
                      <div className="text-xs font-medium mt-1">min</div>
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
                  <span className="text-white font-semibold">
                    Total Price
                  </span>
                  <span className="text-2xl font-bold text-amber-400">
                    ৳{totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
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
                  disabled={
                    isSubmitting ||
                    (bookingMode === 'available' && !selectedAvailableSlot) ||
                    (bookingMode === 'custom' && (!customTime || !customSubject || customMessage.length < 10))
                  }
                  variant="primary"
                  className="flex-1 min-h-[56px] text-base font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <ButtonSpinner light />
                      <span>Sending Request...</span>
                    </>
                  ) : (
                    'Request Session'
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
