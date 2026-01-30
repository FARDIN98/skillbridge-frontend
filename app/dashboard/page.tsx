'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '../../src/components/DashboardLayout';
import { useAuth } from '../../src/contexts/AuthContext';
import api from '../../src/lib/api';
import { Calendar, CheckCircle, Clock, Star, ArrowRight, BookOpen } from 'lucide-react';
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

interface Stats {
  total: number;
  upcoming: number;
  completed: number;
  pendingReviews: number;
}

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    upcoming: 0,
    completed: 0,
    pendingReviews: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/bookings');
        const allBookings: Booking[] = response.data.bookings || response.data || [];

        // Calculate stats
        const now = new Date();
        const upcoming = allBookings.filter(
          b => (b.status === 'CONFIRMED' || b.status === 'PENDING') && new Date(b.dateTime) > now
        );
        const completed = allBookings.filter(b => b.status === 'COMPLETED');
        const pendingReviews = completed.filter(b => !b.review);

        setStats({
          total: allBookings.length,
          upcoming: upcoming.length,
          completed: completed.length,
          pendingReviews: pendingReviews.length
        });

        // Set upcoming bookings (sorted by date, max 5)
        const upcomingBookings = upcoming
          .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
          .slice(0, 5);

        setBookings(upcomingBookings);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600&display=swap');

        .dashboard-page {
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
          transition: all 0.3s ease;
        }

        .glass-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(251, 191, 36, 0.3);
          transform: translateY(-2px);
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, transparent 0%, rgba(251, 191, 36, 0.05) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .stat-card:hover::before {
          opacity: 1;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .stat-card:hover .stat-icon {
          transform: scale(1.1) rotate(5deg);
        }

        .booking-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .booking-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(251, 191, 36, 0.3);
          transform: translateX(4px);
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
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

        .view-all-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 12px;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: #0f172a;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
          text-decoration: none;
        }

        .view-all-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(251, 191, 36, 0.3);
        }

        .empty-state {
          text-align: center;
          padding: 48px 24px;
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
        <div className="dashboard-page">
          {/* Header */}
          <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
            <h1 className="page-title text-3xl md:text-4xl mb-2">
              Welcome back, {user?.name.split(' ')[0]}!
            </h1>
            <p className="text-slate-400 text-sm md:text-base">
              Here's an overview of your learning journey
            </p>
          </div>

          {/* Stats Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="stat-card rounded-2xl p-6 loading-shimmer" style={{ height: '140px' }} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              {/* Total Bookings */}
              <div className="stat-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="stat-icon bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30">
                    <Calendar className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
                <p className="text-slate-400 text-sm mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>

              {/* Upcoming Sessions */}
              <div className="stat-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="stat-icon bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30">
                    <Clock className="h-6 w-6 text-amber-400" />
                  </div>
                </div>
                <p className="text-slate-400 text-sm mb-1">Upcoming Sessions</p>
                <p className="text-3xl font-bold text-white">{stats.upcoming}</p>
              </div>

              {/* Completed Sessions */}
              <div className="stat-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '0.4s', opacity: 0 }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="stat-icon bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                </div>
                <p className="text-slate-400 text-sm mb-1">Completed</p>
                <p className="text-3xl font-bold text-white">{stats.completed}</p>
              </div>

              {/* Pending Reviews */}
              <div className="stat-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '0.5s', opacity: 0 }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="stat-icon bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30">
                    <Star className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
                <p className="text-slate-400 text-sm mb-1">Pending Reviews</p>
                <p className="text-3xl font-bold text-white">{stats.pendingReviews}</p>
              </div>
            </div>
          )}

          {/* Upcoming Bookings Section */}
          <div className="glass-card rounded-2xl p-6 md:p-8 animate-fade-in-up" style={{ animationDelay: '0.6s', opacity: 0 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Upcoming Sessions</h2>
              <Link href="/dashboard/bookings" className="text-amber-400 hover:text-amber-300 text-sm font-medium flex items-center gap-1 transition-colors">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="booking-card rounded-xl p-4 loading-shimmer" style={{ height: '120px' }} />
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <BookOpen className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Upcoming Sessions</h3>
                <p className="text-slate-400 text-sm mb-6">
                  Start your learning journey by booking a session with a tutor
                </p>
                <Link href="/tutors" className="view-all-btn">
                  Browse Tutors
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking, index) => (
                  <div
                    key={booking.id}
                    className="booking-card rounded-xl p-4 md:p-6"
                    style={{ animationDelay: `${0.7 + index * 0.1}s`, opacity: 0 }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 font-bold text-sm">
                            {booking.tutor.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">{booking.tutor.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <Calendar className="h-4 w-4" />
                              <span>{format(new Date(booking.dateTime), 'MMM dd, yyyy')}</span>
                              <span>•</span>
                              <Clock className="h-4 w-4" />
                              <span>{format(new Date(booking.dateTime), 'hh:mm a')}</span>
                            </div>
                          </div>
                        </div>
                        {booking.tutor.tutorProfile?.subjects && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {booking.tutor.tutorProfile.subjects.slice(0, 3).map((subject, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 text-xs rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20"
                              >
                                {subject}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-slate-400 text-xs mb-1">Duration</p>
                          <p className="text-white font-semibold">{booking.duration} min</p>
                        </div>
                        <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {bookings.length > 0 && (
                  <div className="text-center pt-4">
                    <Link href="/dashboard/bookings" className="view-all-btn">
                      View All Bookings
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default StudentDashboard;
