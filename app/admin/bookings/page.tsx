'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../src/components/DashboardLayout';
import api from '../../../src/lib/api';
import { useToast } from '../../../src/contexts/ToastContext';
import { getErrorMessage, logError } from '../../../src/lib/errors';
import { TableRowSkeleton } from '../../../src/components/Skeleton';
import { Search, Filter, Calendar, Clock, DollarSign, User, X } from 'lucide-react';
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
  tutor: {
    id: string;
    name: string;
    email: string;
    hourlyRate?: number;
  };
  review?: {
    id: string;
    rating: number;
    comment: string;
  };
}

type StatusFilter = 'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

const AdminBookingsPage: React.FC = () => {
  const { showError } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/bookings', {
        params: {
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          search: searchQuery || undefined
        }
      });
      const bookingData = response.data.bookings || response.data || [];
      setBookings(bookingData);
      setFilteredBookings(bookingData);
    } catch (error: any) {
      logError(error, 'Fetch Bookings');
      const errorMessage = getErrorMessage(error);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter bookings based on search and status
  useEffect(() => {
    let filtered = [...bookings];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        booking =>
          booking.student.name.toLowerCase().includes(query) ||
          booking.student.email.toLowerCase().includes(query) ||
          booking.tutor.name.toLowerCase().includes(query) ||
          booking.tutor.email.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Sort by date (most recent first)
    filtered.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

    setFilteredBookings(filtered);
  }, [searchQuery, statusFilter, bookings]);

  const calculatePrice = (booking: Booking): number => {
    if (!booking.tutor.hourlyRate) return 0;
    return (booking.tutor.hourlyRate * booking.duration) / 60;
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'PENDING':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'COMPLETED':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'CANCELLED':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

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

        .search-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 12px 16px;
          transition: all 0.3s ease;
        }

        .search-bar:focus-within {
          background: rgba(255, 255, 255, 0.08);
          border-color: #fbbf24;
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
        }

        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #f1f5f9;
          font-size: 14px;
        }

        .search-input::placeholder {
          color: #64748b;
        }

        .filter-select {
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #f1f5f9;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-select:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.08);
          border-color: #fbbf24;
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
        }

        .filter-select option {
          background: #0f172a;
          color: #cbd5e1;
          padding: 12px;
          font-weight: 500;
        }

        .filter-select option:checked {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: #0f172a;
          font-weight: 600;
        }

        .bookings-table {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          overflow: hidden;
        }

        .table-header {
          display: grid;
          grid-template-columns: 1.2fr 1.2fr 1fr 100px 120px 100px 140px;
          gap: 16px;
          padding: 16px 24px;
          background: rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #cbd5e1;
        }

        .table-row {
          display: grid;
          grid-template-columns: 1.2fr 1.2fr 1fr 100px 120px 100px 140px;
          gap: 16px;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
          align-items: center;
          cursor: pointer;
        }

        .table-row:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .table-row:last-child {
          border-bottom: none;
        }

        @media (max-width: 1024px) {
          .table-header,
          .table-row {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .table-header {
            display: none;
          }

          .table-row {
            padding: 16px;
            cursor: default;
          }
        }

        .badge {
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
          border: 1px solid;
          display: inline-block;
        }

        .view-details-btn {
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          background: rgba(251, 191, 36, 0.1);
          border: 1px solid rgba(251, 191, 36, 0.3);
          color: #fbbf24;
        }

        .view-details-btn:hover {
          background: rgba(251, 191, 36, 0.2);
          transform: translateY(-2px);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 16px;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-content {
          background: rgba(15, 23, 42, 0.98);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 32px;
          max-width: 600px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.3s ease-out;
          max-height: 90vh;
          overflow-y: auto;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .modal-title {
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          color: #f1f5f9;
          font-size: 24px;
        }

        .close-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #cbd5e1;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(251, 191, 36, 0.3);
          color: #fbbf24;
        }

        .detail-section {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
        }

        .detail-section-title {
          color: #fbbf24;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
        }

        .detail-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .detail-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .detail-label {
          color: #64748b;
          font-size: 13px;
          min-width: 100px;
        }

        .detail-value {
          color: #f1f5f9;
          font-size: 14px;
          font-weight: 500;
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
          border-radius: 12px;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
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
          padding: 64px 24px;
          color: #64748b;
        }

        .mobile-label {
          display: none;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #64748b;
          margin-bottom: 4px;
        }

        @media (max-width: 1024px) {
          .mobile-label {
            display: block;
          }

          .view-details-btn {
            width: 100%;
            justify-content: center;
            display: flex;
          }
        }

        .review-section {
          background: rgba(251, 191, 36, 0.05);
          border: 1px solid rgba(251, 191, 36, 0.2);
          border-radius: 12px;
          padding: 16px;
          margin-top: 12px;
        }

        .star-rating {
          display: flex;
          gap: 4px;
          margin-bottom: 8px;
        }

        .star-icon {
          width: 16px;
          height: 16px;
        }

        .star-icon.filled {
          fill: #fbbf24;
          color: #fbbf24;
        }

        .star-icon.empty {
          color: #64748b;
        }
      `}</style>

      <DashboardLayout allowedRoles={['ADMIN']}>
        <div className="bookings-page">
          {/* Header */}
          <div
            className="mb-6 animate-fade-in-up"
            style={{ animationDelay: '0.1s', opacity: 0 }}
          >
            <h1 className="page-title text-3xl md:text-4xl mb-2">All Bookings</h1>
            <p className="text-slate-400 text-sm md:text-base">
              View and manage all platform bookings
            </p>
          </div>

          {/* Filters */}
          <div
            className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up"
            style={{ animationDelay: '0.2s', opacity: 0 }}
          >
            <div className="search-bar">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by student or tutor name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-slate-400 flex-shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="filter-select flex-1"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Bookings Table */}
          {loading ? (
            <div className="bookings-table">
              <div className="table-header">
                <div>Student</div>
                <div>Tutor</div>
                <div>Date & Time</div>
                <div>Duration</div>
                <div>Status</div>
                <div>Price</div>
                <div>Actions</div>
              </div>
              <table className="w-full">
                <tbody>
                  {[...Array(5)].map((_, i) => (
                    <TableRowSkeleton key={i} columns={7} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div
              className="empty-state animate-fade-in-up"
              style={{ animationDelay: '0.3s', opacity: 0 }}
            >
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-semibold mb-1">No bookings found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div
              className="bookings-table animate-fade-in-up"
              style={{ animationDelay: '0.3s', opacity: 0 }}
            >
              <div className="table-header">
                <div>Student</div>
                <div>Tutor</div>
                <div>Date & Time</div>
                <div>Duration</div>
                <div>Status</div>
                <div>Price</div>
                <div>Actions</div>
              </div>

              {filteredBookings.map((booking, index) => (
                <div
                  key={booking.id}
                  className="table-row animate-fade-in-up"
                  style={{ animationDelay: `${0.4 + index * 0.05}s`, opacity: 0 }}
                >
                  <div>
                    <span className="mobile-label">Student</span>
                    <p className="text-white font-medium text-sm">{booking.student.name}</p>
                    <p className="text-slate-400 text-xs">{booking.student.email}</p>
                  </div>

                  <div>
                    <span className="mobile-label">Tutor</span>
                    <p className="text-white font-medium text-sm">{booking.tutor.name}</p>
                    <p className="text-slate-400 text-xs">{booking.tutor.email}</p>
                  </div>

                  <div>
                    <span className="mobile-label">Date & Time</span>
                    <p className="text-slate-300 text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-amber-400" />
                      {format(new Date(booking.dateTime), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-slate-400 text-xs flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-amber-400" />
                      {format(new Date(booking.dateTime), 'hh:mm a')}
                    </p>
                  </div>

                  <div>
                    <span className="mobile-label">Duration</span>
                    <p className="text-slate-300 text-sm">{booking.duration} min</p>
                  </div>

                  <div>
                    <span className="mobile-label">Status</span>
                    <span className={`badge ${getStatusBadgeColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>

                  <div>
                    <span className="mobile-label">Price</span>
                    <p className="text-emerald-400 font-semibold text-sm flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {calculatePrice(booking).toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <span className="mobile-label">Actions</span>
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="view-details-btn"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          <div
            className="mt-6 text-slate-400 text-sm animate-fade-in-up"
            style={{ animationDelay: '0.5s', opacity: 0 }}
          >
            Showing {filteredBookings.length} of {bookings.length} bookings
          </div>
        </div>

        {/* Booking Details Modal */}
        {selectedBooking && (
          <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Booking Details</h2>
                <button onClick={() => setSelectedBooking(null)} className="close-btn">
                  <X size={16} />
                </button>
              </div>

              {/* Student Info */}
              <div className="detail-section">
                <div className="detail-section-title">Student Information</div>
                <div className="detail-row">
                  <span className="detail-label">Name</span>
                  <span className="detail-value">{selectedBooking.student.name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{selectedBooking.student.email}</span>
                </div>
              </div>

              {/* Tutor Info */}
              <div className="detail-section">
                <div className="detail-section-title">Tutor Information</div>
                <div className="detail-row">
                  <span className="detail-label">Name</span>
                  <span className="detail-value">{selectedBooking.tutor.name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{selectedBooking.tutor.email}</span>
                </div>
                {selectedBooking.tutor.hourlyRate && (
                  <div className="detail-row">
                    <span className="detail-label">Hourly Rate</span>
                    <span className="detail-value">${selectedBooking.tutor.hourlyRate}/hr</span>
                  </div>
                )}
              </div>

              {/* Booking Info */}
              <div className="detail-section">
                <div className="detail-section-title">Session Details</div>
                <div className="detail-row">
                  <span className="detail-label">Date</span>
                  <span className="detail-value">
                    {format(new Date(selectedBooking.dateTime), 'MMMM dd, yyyy')}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Time</span>
                  <span className="detail-value">
                    {format(new Date(selectedBooking.dateTime), 'hh:mm a')}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Duration</span>
                  <span className="detail-value">{selectedBooking.duration} minutes</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status</span>
                  <span className={`badge ${getStatusBadgeColor(selectedBooking.status)}`}>
                    {selectedBooking.status}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Total Price</span>
                  <span className="detail-value text-emerald-400 font-semibold">
                    ${calculatePrice(selectedBooking).toFixed(2)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Booked On</span>
                  <span className="detail-value">
                    {format(new Date(selectedBooking.createdAt), 'MMM dd, yyyy hh:mm a')}
                  </span>
                </div>
              </div>

              {/* Review Info */}
              {selectedBooking.review && (
                <div className="detail-section">
                  <div className="detail-section-title">Student Review</div>
                  <div className="review-section">
                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`star-icon ${star <= selectedBooking.review!.rating ? 'filled' : 'empty'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-amber-400 font-semibold text-sm ml-2">
                        {selectedBooking.review.rating}/5
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm">{selectedBooking.review.comment}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DashboardLayout>
    </>
  );
};

export default AdminBookingsPage;
