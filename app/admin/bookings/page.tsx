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
      <DashboardLayout allowedRoles={['ADMIN']}>
        <div className="font-sans">
          {/* Header */}
          <div className="mb-6 opacity-0 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            <h1 className="text-3xl md:text-4xl mb-2 font-bold text-slate-100">All Bookings</h1>
            <p className="text-slate-400 text-sm md:text-base">
              View and manage all platform bookings
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 opacity-0 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 transition-all duration-300 focus-within:bg-white/8 focus-within:border-amber-400 focus-within:ring-3 focus-within:ring-amber-400/10">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by student or tutor name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-slate-100 text-sm placeholder:text-slate-500"
              />
            </div>

            <div className="relative flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 transition-all duration-300 focus-within:bg-white/8 focus-within:border-amber-400 focus-within:ring-3 focus-within:ring-amber-400/10">
              <Filter className="h-5 w-5 text-slate-400 flex-shrink-0 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="flex-1 bg-transparent border-none outline-none text-slate-100 text-sm cursor-pointer appearance-none pr-8"
              >
                <option value="ALL" className="bg-slate-900 text-slate-300">All Status</option>
                <option value="PENDING" className="bg-slate-900 text-slate-300">Pending</option>
                <option value="CONFIRMED" className="bg-slate-900 text-slate-300">Confirmed</option>
                <option value="COMPLETED" className="bg-slate-900 text-slate-300">Completed</option>
                <option value="CANCELLED" className="bg-slate-900 text-slate-300">Cancelled</option>
              </select>
              <svg className="absolute right-4 h-4 w-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Bookings Table */}
          {loading ? (
            <div className="bg-white/3 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden">
              <div className="hidden lg:grid grid-cols-[1.2fr_1.2fr_1fr_100px_120px_100px_140px] gap-4 px-6 py-4 bg-white/5 border-b border-white/10 font-semibold text-xs uppercase tracking-wide text-slate-300">
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
            <div className="text-center py-16 px-6 text-slate-500 opacity-0 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-semibold mb-1">No bookings found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="opacity-0 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              {/* Desktop Table Header */}
              <div className="hidden lg:grid lg:bg-white/3 lg:backdrop-blur-2xl lg:border lg:border-white/10 lg:rounded-2xl lg:overflow-hidden">
                <div className="grid grid-cols-[1.2fr_1.2fr_1fr_100px_120px_100px_140px] gap-4 px-6 py-4 bg-white/5 border-b border-white/10 font-semibold text-xs uppercase tracking-wide text-slate-300">
                  <div>Student</div>
                  <div>Tutor</div>
                  <div>Date & Time</div>
                  <div>Duration</div>
                  <div>Status</div>
                  <div>Price</div>
                  <div>Actions</div>
                </div>

                {/* Desktop Rows */}
                {filteredBookings.map((booking, index) => (
                  <div
                    key={booking.id}
                    className="grid grid-cols-[1.2fr_1.2fr_1fr_100px_120px_100px_140px] gap-4 px-6 py-5 border-b border-white/5 last:border-b-0 transition-all duration-300 items-center cursor-pointer hover:bg-white/5 opacity-0 animate-fadeInUp"
                    style={{ animationDelay: `${0.4 + index * 0.05}s` }}
                  >
                    <div>
                      <p className="text-white font-medium text-sm">{booking.student.name}</p>
                      <p className="text-slate-400 text-xs truncate">{booking.student.email}</p>
                    </div>

                    <div>
                      <p className="text-white font-medium text-sm">{booking.tutor.name}</p>
                      <p className="text-slate-400 text-xs truncate">{booking.tutor.email}</p>
                    </div>

                    <div>
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
                      <p className="text-slate-300 text-sm">{booking.duration} min</p>
                    </div>

                    <div>
                      <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap border ${getStatusBadgeColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>

                    <div>
                      <p className="text-emerald-400 font-semibold text-sm flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {calculatePrice(booking).toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="px-4 py-2 rounded-xl text-[13px] font-semibold cursor-pointer transition-all duration-300 bg-amber-400/10 border border-amber-400/30 text-amber-400 hover:bg-amber-400/20 hover:-translate-y-0.5 flex items-center justify-center"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4">
                {filteredBookings.map((booking, index) => (
                  <div
                    key={booking.id}
                    className="bg-white/3 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 space-y-4 transition-all duration-300 hover:bg-white/5 hover:border-amber-400/30 opacity-0 animate-fadeInUp"
                    style={{ animationDelay: `${0.4 + index * 0.05}s` }}
                  >
                    <div>
                      <span className="block font-semibold text-xs uppercase tracking-wide text-slate-500 mb-1">Student</span>
                      <p className="text-white font-medium text-sm">{booking.student.name}</p>
                      <p className="text-slate-400 text-xs">{booking.student.email}</p>
                    </div>

                    <div>
                      <span className="block font-semibold text-xs uppercase tracking-wide text-slate-500 mb-1">Tutor</span>
                      <p className="text-white font-medium text-sm">{booking.tutor.name}</p>
                      <p className="text-slate-400 text-xs">{booking.tutor.email}</p>
                    </div>

                    <div>
                      <span className="block font-semibold text-xs uppercase tracking-wide text-slate-500 mb-1">Date & Time</span>
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
                      <span className="block font-semibold text-xs uppercase tracking-wide text-slate-500 mb-1">Duration</span>
                      <p className="text-slate-300 text-sm">{booking.duration} min</p>
                    </div>

                    <div>
                      <span className="block font-semibold text-xs uppercase tracking-wide text-slate-500 mb-1">Status</span>
                      <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap border ${getStatusBadgeColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>

                    <div>
                      <span className="block font-semibold text-xs uppercase tracking-wide text-slate-500 mb-1">Price</span>
                      <p className="text-emerald-400 font-semibold text-sm flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {calculatePrice(booking).toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <span className="block font-semibold text-xs uppercase tracking-wide text-slate-500 mb-1">Actions</span>
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="w-full px-4 py-2 rounded-xl text-[13px] font-semibold cursor-pointer transition-all duration-300 bg-amber-400/10 border border-amber-400/30 text-amber-400 hover:bg-amber-400/20 hover:-translate-y-0.5 flex items-center justify-center"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="mt-6 text-slate-400 text-sm opacity-0 animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
            Showing {filteredBookings.length} of {bookings.length} bookings
          </div>
        </div>

        {/* Booking Details Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 w-screen h-screen bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fadeIn" onClick={() => setSelectedBooking(null)}>
            <div className="bg-slate-900/98 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 max-w-[600px] w-full shadow-[0_20px_60px_rgba(0,0,0,0.5)] animate-slideUp max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-100">Booking Details</h2>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-slate-300 cursor-pointer transition-all duration-300 flex items-center justify-center hover:bg-white/10 hover:border-amber-400/30 hover:text-amber-400"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Student Info */}
              <div className="bg-white/3 border border-white/10 rounded-xl p-5 mb-4">
                <div className="text-amber-400 font-semibold text-sm uppercase tracking-wide mb-3">Student Information</div>
                <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-b-0 last:pb-0">
                  <span className="text-slate-500 text-[13px] min-w-[100px]">Name</span>
                  <span className="text-slate-100 text-sm font-medium">{selectedBooking.student.name}</span>
                </div>
                <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-b-0 last:pb-0">
                  <span className="text-slate-500 text-[13px] min-w-[100px]">Email</span>
                  <span className="text-slate-100 text-sm font-medium">{selectedBooking.student.email}</span>
                </div>
              </div>

              {/* Tutor Info */}
              <div className="bg-white/3 border border-white/10 rounded-xl p-5 mb-4">
                <div className="text-amber-400 font-semibold text-sm uppercase tracking-wide mb-3">Tutor Information</div>
                <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-b-0 last:pb-0">
                  <span className="text-slate-500 text-[13px] min-w-[100px]">Name</span>
                  <span className="text-slate-100 text-sm font-medium">{selectedBooking.tutor.name}</span>
                </div>
                <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-b-0 last:pb-0">
                  <span className="text-slate-500 text-[13px] min-w-[100px]">Email</span>
                  <span className="text-slate-100 text-sm font-medium">{selectedBooking.tutor.email}</span>
                </div>
                {selectedBooking.tutor.hourlyRate && (
                  <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-b-0 last:pb-0">
                    <span className="text-slate-500 text-[13px] min-w-[100px]">Hourly Rate</span>
                    <span className="text-slate-100 text-sm font-medium">${selectedBooking.tutor.hourlyRate}/hr</span>
                  </div>
                )}
              </div>

              {/* Booking Info */}
              <div className="bg-white/3 border border-white/10 rounded-xl p-5 mb-4">
                <div className="text-amber-400 font-semibold text-sm uppercase tracking-wide mb-3">Session Details</div>
                <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-b-0 last:pb-0">
                  <span className="text-slate-500 text-[13px] min-w-[100px]">Date</span>
                  <span className="text-slate-100 text-sm font-medium">
                    {format(new Date(selectedBooking.dateTime), 'MMMM dd, yyyy')}
                  </span>
                </div>
                <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-b-0 last:pb-0">
                  <span className="text-slate-500 text-[13px] min-w-[100px]">Time</span>
                  <span className="text-slate-100 text-sm font-medium">
                    {format(new Date(selectedBooking.dateTime), 'hh:mm a')}
                  </span>
                </div>
                <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-b-0 last:pb-0">
                  <span className="text-slate-500 text-[13px] min-w-[100px]">Duration</span>
                  <span className="text-slate-100 text-sm font-medium">{selectedBooking.duration} minutes</span>
                </div>
                <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-b-0 last:pb-0">
                  <span className="text-slate-500 text-[13px] min-w-[100px]">Status</span>
                  <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap border ${getStatusBadgeColor(selectedBooking.status)}`}>
                    {selectedBooking.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-b-0 last:pb-0">
                  <span className="text-slate-500 text-[13px] min-w-[100px]">Total Price</span>
                  <span className="text-emerald-400 font-semibold text-sm">
                    ${calculatePrice(selectedBooking).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-b-0 last:pb-0">
                  <span className="text-slate-500 text-[13px] min-w-[100px]">Booked On</span>
                  <span className="text-slate-100 text-sm font-medium">
                    {format(new Date(selectedBooking.createdAt), 'MMM dd, yyyy hh:mm a')}
                  </span>
                </div>
              </div>

              {/* Review Info */}
              {selectedBooking.review && (
                <div className="bg-white/3 border border-white/10 rounded-xl p-5 mb-4">
                  <div className="text-amber-400 font-semibold text-sm uppercase tracking-wide mb-3">Student Review</div>
                  <div className="bg-amber-400/5 border border-amber-400/20 rounded-xl p-4 mt-3">
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${star <= selectedBooking.review!.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
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
