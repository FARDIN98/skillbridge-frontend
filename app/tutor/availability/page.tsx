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
      <>
        <style jsx global>{`
          .loading-screen {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 400px;
          }
          .loading-spinner {
            width: 50px;
            height: 50px;
            border: 3px solid rgba(251, 191, 36, 0.1);
            border-top-color: #fbbf24;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <DashboardLayout allowedRoles={['TUTOR']}>
          <div className="loading-screen">
            <div className="loading-spinner" />
          </div>
        </DashboardLayout>
      </>
    );
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600&display=swap');

        .availability-page {
          font-family: 'Inter', sans-serif;
        }

        .page-title {
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          color: #f1f5f9;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }

        .form-label {
          display: block;
          color: #cbd5e1;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .form-select, .form-input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #f1f5f9;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .form-select:focus, .form-input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.08);
          border-color: #fbbf24;
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .success-message {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #4ade80;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .add-slot-form {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr auto;
          gap: 12px;
          align-items: end;
          margin-bottom: 24px;
        }

        @media (max-width: 768px) {
          .add-slot-form {
            grid-template-columns: 1fr;
          }
        }

        .add-btn {
          padding: 12px 20px;
          border-radius: 12px;
          background: rgba(251, 191, 36, 0.1);
          border: 1px solid rgba(251, 191, 36, 0.3);
          color: #fbbf24;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }

        .add-btn:hover {
          background: rgba(251, 191, 36, 0.2);
        }

        .day-section {
          margin-bottom: 16px;
        }

        .day-header {
          color: #fbbf24;
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 8px;
          padding: 8px 12px;
          background: rgba(251, 191, 36, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(251, 191, 36, 0.2);
        }

        .time-slot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 8px;
          transition: all 0.3s ease;
        }

        .time-slot:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(251, 191, 36, 0.3);
        }

        .time-text {
          color: #cbd5e1;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .remove-btn {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .remove-btn:hover {
          background: rgba(239, 68, 68, 0.2);
        }

        .submit-btn {
          width: 100%;
          padding: 14px 24px;
          border-radius: 12px;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: #0f172a;
          font-weight: 600;
          font-size: 14px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(251, 191, 36, 0.3);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #0f172a;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
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

        .empty-state {
          text-align: center;
          padding: 48px 24px;
          color: #64748b;
        }
      `}</style>

      <DashboardLayout allowedRoles={['TUTOR']}>
        <div className="availability-page">
          {/* Header */}
          <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
            <h1 className="page-title text-3xl md:text-4xl mb-2">Availability</h1>
            <p className="text-slate-400 text-sm md:text-base">
              Set your available time slots for students to book sessions
            </p>
          </div>

          {/* Main Form */}
          <div className="glass-card rounded-2xl p-6 md:p-8 animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              {success && (
                <div className="success-message">
                  <CheckCircle size={16} />
                  Availability updated successfully!
                </div>
              )}

              {/* Add Time Slot Form */}
              <div className="mb-6">
                <h3 className="text-white font-semibold mb-4">Add Time Slot</h3>
                <div className="add-slot-form">
                  <div>
                    <label className="form-label">Day</label>
                    <select
                      value={newSlot.day}
                      onChange={(e) => setNewSlot(prev => ({ ...prev, day: e.target.value }))}
                      className="form-select"
                    >
                      {DAYS_OF_WEEK.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Start Time</label>
                    <input
                      type="time"
                      value={newSlot.startTime}
                      onChange={(e) => setNewSlot(prev => ({ ...prev, startTime: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">End Time</label>
                    <input
                      type="time"
                      value={newSlot.endTime}
                      onChange={(e) => setNewSlot(prev => ({ ...prev, endTime: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSlot}
                    className="add-btn"
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
                  <div className="empty-state">
                    <p>No time slots added yet. Add your first slot above.</p>
                  </div>
                ) : (
                  <div>
                    {slotsByDay.map(({ day, slots }) =>
                      slots.length > 0 && (
                        <div key={day} className="day-section">
                          <div className="day-header">{day}</div>
                          {slots.map(({ startTime, endTime, originalIndex }) => (
                            <div key={originalIndex} className="time-slot">
                              <div className="time-text">
                                <Clock size={16} />
                                {startTime} - {endTime}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveSlot(originalIndex)}
                                className="remove-btn"
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
                disabled={isSubmitting}
                className="submit-btn"
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner" />
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
    </>
  );
};

export default TutorAvailabilityPage;
