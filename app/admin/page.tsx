'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../src/components/DashboardLayout';
import api from '../../src/lib/api';
import { useRouter } from 'next/navigation';
import {
  Users,
  GraduationCap,
  UserCircle,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';

interface AdminStats {
  totalUsers: number;
  totalTutors: number;
  totalStudents: number;
  totalBookings: number;
  totalRevenue: number;
  activeTutors: number;
  bookingsByStatus: {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
}

interface RecentBooking {
  id: string;
  dateTime: string;
  duration: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  student: {
    name: string;
    email: string;
  };
  tutor: {
    name: string;
    email: string;
  };
}

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsResponse, bookingsResponse] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/bookings?limit=5')
        ]);

        setStats(statsResponse.data);
        setRecentBookings(bookingsResponse.data.bookings || bookingsResponse.data || []);
      } catch (error) {
        console.error('Failed to fetch admin dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = stats ? [
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400',
      subtitle: `${stats.totalStudents || 0} students, ${stats.totalTutors || 0} tutors`
    },
    {
      title: 'Total Tutors',
      value: stats.totalTutors || 0,
      icon: GraduationCap,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      textColor: 'text-purple-400',
      subtitle: `${stats.activeTutors || 0} active tutors`
    },
    {
      title: 'Total Students',
      value: stats.totalStudents || 0,
      icon: UserCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      textColor: 'text-green-400',
      subtitle: 'Registered students'
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings || 0,
      icon: Calendar,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      textColor: 'text-amber-400',
      subtitle: `${stats.bookingsByStatus?.completed || 0} completed`
    },
    {
      title: 'Total Revenue',
      value: `$${(stats.totalRevenue || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-400',
      subtitle: 'From completed sessions'
    },
    {
      title: 'Active Tutors',
      value: stats.activeTutors || 0,
      icon: TrendingUp,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/30',
      textColor: 'text-pink-400',
      subtitle: 'Tutors with sessions'
    }
  ] : [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4" />;
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600&display=swap');

        .admin-dashboard {
          font-family: 'Inter', sans-serif;
        }

        .page-title {
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          color: #f1f5f9;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(251, 191, 36, 0.3);
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
        }

        .stat-icon-wrapper {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid;
        }

        .stat-value {
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          font-size: 32px;
          color: #f1f5f9;
          line-height: 1.2;
        }

        .stat-title {
          color: #cbd5e1;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .stat-subtitle {
          color: #64748b;
          font-size: 12px;
        }

        .section-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 24px;
        }

        .section-title {
          color: #f1f5f9;
          font-weight: 600;
          font-size: 18px;
          margin-bottom: 20px;
        }

        .booking-row {
          display: grid;
          grid-template-columns: auto 1fr 1fr auto auto;
          gap: 16px;
          align-items: center;
          padding: 16px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          margin-bottom: 12px;
          transition: all 0.3s ease;
        }

        .booking-row:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(251, 191, 36, 0.3);
        }

        @media (max-width: 768px) {
          .booking-row {
            grid-template-columns: 1fr;
            gap: 8px;
          }
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 4px;
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

        .action-btn {
          padding: 12px 20px;
          border-radius: 12px;
          background: rgba(251, 191, 36, 0.1);
          border: 1px solid rgba(251, 191, 36, 0.3);
          color: #fbbf24;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .action-btn:hover {
          background: rgba(251, 191, 36, 0.2);
          transform: translateX(4px);
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
          border-radius: 16px;
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

      <DashboardLayout allowedRoles={['ADMIN']}>
        <div className="admin-dashboard">
          {/* Header */}
          <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
            <h1 className="page-title text-3xl md:text-4xl mb-2">Admin Dashboard</h1>
            <p className="text-slate-400 text-sm md:text-base">
              Manage users, bookings, and platform statistics
            </p>
          </div>

          {/* Stats Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="loading-shimmer"
                  style={{ height: '160px' }}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {statCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className="stat-card animate-fade-in-up"
                    style={{ animationDelay: `${0.2 + index * 0.05}s`, opacity: 0 }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <p className="stat-title">{card.title}</p>
                        <h3 className="stat-value mb-1">{card.value}</h3>
                        <p className="stat-subtitle">{card.subtitle}</p>
                      </div>
                      <div className={`stat-icon-wrapper ${card.bgColor} ${card.borderColor} ${card.textColor}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recent Bookings */}
          <div className="section-card animate-fade-in-up mb-8" style={{ animationDelay: '0.5s', opacity: 0 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title mb-0">Recent Bookings</h2>
              <button
                onClick={() => router.push('/admin/bookings')}
                className="action-btn"
              >
                View All
                <ArrowRight size={16} />
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="loading-shimmer"
                    style={{ height: '80px' }}
                  />
                ))}
              </div>
            ) : recentBookings.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No bookings yet</p>
              </div>
            ) : (
              <div>
                {recentBookings.map((booking, index) => (
                  <div
                    key={booking.id}
                    className="booking-row animate-fade-in-up"
                    style={{ animationDelay: `${0.6 + index * 0.05}s`, opacity: 0 }}
                  >
                    <div className={`status-badge status-${booking.status.toLowerCase()}`}>
                      {getStatusIcon(booking.status)}
                      {booking.status}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{booking.student.name}</p>
                      <p className="text-slate-400 text-xs">{booking.student.email}</p>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{booking.tutor.name}</p>
                      <p className="text-slate-400 text-xs">{booking.tutor.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-300 text-sm">
                        {format(new Date(booking.dateTime), 'MMM dd, yyyy')}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {format(new Date(booking.dateTime), 'hh:mm a')}
                      </p>
                    </div>
                    <div className="text-slate-400 text-sm">
                      {booking.duration} min
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '0.8s', opacity: 0 }}>
            <div
              className="section-card cursor-pointer group"
              onClick={() => router.push('/admin/users')}
            >
              <div className="flex items-center gap-4">
                <div className="stat-icon-wrapper bg-blue-500/10 border-blue-500/30 text-blue-400">
                  <Users className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">Manage Users</h3>
                  <p className="text-slate-400 text-sm">View and manage all platform users</p>
                </div>
                <ArrowRight className="h-5 w-5 text-amber-400 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>

            <div
              className="section-card cursor-pointer group"
              onClick={() => router.push('/admin/categories')}
            >
              <div className="flex items-center gap-4">
                <div className="stat-icon-wrapper bg-purple-500/10 border-purple-500/30 text-purple-400">
                  <Calendar className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">Manage Categories</h3>
                  <p className="text-slate-400 text-sm">Add, edit, or remove tutor categories</p>
                </div>
                <ArrowRight className="h-5 w-5 text-amber-400 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default AdminDashboard;
