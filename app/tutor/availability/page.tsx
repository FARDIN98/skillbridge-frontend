'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../src/components/DashboardLayout';
import api from '../../../src/lib/api';
import { Save, AlertCircle, CheckCircle, Plus, X, Clock } from 'lucide-react';

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const TutorAvailabilityPage: React.FC = () => {
  const [availability, setAvailability] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [originalAvailability, setOriginalAvailability] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [newSlot, setNewSlot] = useState<TimeSlot>({
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00'
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const response = await api.get('/tutors/profile');
        const profile = response.data.tutorProfile || response.data;

        if (profile && profile.availability) {
          setAvailability(profile.availability);
          setOriginalAvailability(profile.availability);
          // Parse availability strings into TimeSlot objects
          const slots: TimeSlot[] = profile.availability.map((slot: string) => {
            const [day, timeRange] = slot.split(' ');
            const [startTime, endTime] = timeRange.split('-');
            return { day, startTime, endTime };
          });
          setTimeSlots(slots);
        }
      } catch (error) {
        console.error('Failed to fetch availability:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, []);

  const formatTimeSlot = (slot: TimeSlot): string => {
    return `${slot.day} ${slot.startTime}-${slot.endTime}`;
  };

  const handleAddSlot = () => {
    // Validate times
    if (newSlot.startTime >= newSlot.endTime) {
      setError('End time must be after start time');
      return;
    }

    const formatted = formatTimeSlot(newSlot);

    // Check for duplicates
    if (availability.includes(formatted)) {
      setError('This time slot already exists');
      return;
    }

    setTimeSlots(prev => [...prev, newSlot]);
    setAvailability(prev => [...prev, formatted]);
    setHasUnsavedChanges(true);
    setError(null);

    // Reset form
    setNewSlot({
      day: 'Monday',
      startTime: '09:00',
      endTime: '10:00'
    });
  };

  const handleRemoveSlot = (index: number) => {
    setTimeSlots(prev => prev.filter((_, i) => i !== index));
    setAvailability(prev => prev.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError(null);

    if (availability.length === 0) {
      setError('Please add at least one time slot');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.put('/tutors/availability', { availability });
      setOriginalAvailability(availability);
      setHasUnsavedChanges(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to update availability');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group slots by day
  const slotsByDay = DAYS_OF_WEEK.map(day => ({
    day,
    slots: timeSlots
      .map((slot, index) => ({ ...slot, originalIndex: index }))
      .filter(slot => slot.day === day)
  }));

  if (loading) {
    return (
      <DashboardLayout allowedRoles={['TUTOR']}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-3 border-amber-400/10 border-t-amber-400 rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRoles={['TUTOR']}>
      <div className="font-sans">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif font-bold text-slate-100 text-3xl md:text-4xl mb-2">Availability</h1>
          <p className="text-slate-400 text-sm md:text-base">
            Set your available time slots for students to book sessions
          </p>
        </div>

        {/* Main Form */}
        <div className="bg-white/3 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-sm mb-4 flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-xl text-sm mb-4 flex items-center gap-2">
                <CheckCircle size={16} />
                Availability updated successfully!
              </div>
            )}

            {hasUnsavedChanges && !success && (
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-3 rounded-xl text-sm mb-4 flex items-center gap-2">
                <AlertCircle size={16} />
                You have unsaved changes. Click &quot;Save Availability&quot; to persist them.
              </div>
            )}

            {/* Add Time Slot Form */}
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-4">Add Time Slot</h3>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Day</label>
                  <select
                    value={newSlot.day}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, day: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-100 text-sm transition-all focus:outline-none focus:bg-white/8 focus:border-amber-400 focus:ring-3 focus:ring-amber-400/10 [&>option]:bg-slate-800 [&>option]:text-slate-100 [&>option]:py-3"
                  >
                    {DAYS_OF_WEEK.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Start Time</label>
                  <input
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-100 text-sm transition-all focus:outline-none focus:bg-white/8 focus:border-amber-400 focus:ring-3 focus:ring-amber-400/10"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">End Time</label>
                  <input
                    type="time"
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-100 text-sm transition-all focus:outline-none focus:bg-white/8 focus:border-amber-400 focus:ring-3 focus:ring-amber-400/10"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddSlot}
                  className="px-5 py-3 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 font-semibold text-sm cursor-pointer transition-all hover:bg-amber-400/20 flex items-center gap-2 whitespace-nowrap justify-center"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
            </div>

            {/* Current Availability */}
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-4">Your Availability</h3>
              {timeSlots.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <p>No time slots added yet. Add your first slot above.</p>
                </div>
              ) : (
                <div>
                  {slotsByDay.map(({ day, slots }) =>
                    slots.length > 0 && (
                      <div key={day} className="mb-4">
                        <div className="text-amber-400 font-semibold text-base mb-2 px-3 py-2 bg-amber-400/5 rounded-lg border border-amber-400/20">
                          {day}
                        </div>
                        {slots.map(({ startTime, endTime, originalIndex }) => (
                          <div
                            key={originalIndex}
                            className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/3 border border-white/10 mb-2 transition-all hover:bg-white/5 hover:border-amber-400/30"
                          >
                            <div className="text-slate-300 text-sm flex items-center gap-2">
                              <Clock size={16} />
                              {startTime} - {endTime}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveSlot(originalIndex)}
                              className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all hover:bg-red-500/20 flex items-center gap-1"
                            >
                              <X size={14} />
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !hasUnsavedChanges}
              className={`w-full px-6 py-3.5 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-900 font-semibold text-sm border-0 cursor-pointer transition-all flex items-center justify-center gap-2 ${
                hasUnsavedChanges && !isSubmitting
                  ? 'hover:shadow-[0_10px_30px_rgba(251,191,36,0.3)] hover:-translate-y-0.5 animate-pulse'
                  : 'opacity-60 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Availability
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TutorAvailabilityPage;
