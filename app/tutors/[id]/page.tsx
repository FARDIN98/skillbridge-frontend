'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Star,
  BookOpen,
  DollarSign,
  Clock,
  Calendar,
  Award,
  Briefcase,
  MessageSquare,
  ChevronLeft,
  Sparkles,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../../../src/lib/api';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useToast } from '../../../src/contexts/ToastContext';
import Navbar from '../../../src/components/Navbar';
import Footer from '../../../src/components/Footer';
import BookingModal from '../../../src/components/BookingModal';
import Button from '../../../src/components/Button';
import ErrorMessage from '../../../src/components/ErrorMessage';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  student: {
    id: string;
    name: string;
  };
}

interface TutorProfile {
  id: string;
  userId: string;
  bio: string | null;
  hourlyRate: number;
  subjects: string[];
  experience: number;
  rating: number;
  reviewCount: number;
  availability: string[] | null;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  categories: {
    id: string;
    name: string;
    slug: string;
  }[];
}

const TutorProfilePage = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { showWarning } = useToast();
  const tutorId = params.id as string;

  const [tutor, setTutor] = useState<TutorProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    const fetchTutorData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [tutorRes, reviewsRes] = await Promise.all([
          api.get(`/tutors/${tutorId}`),
          api.get(`/reviews/tutor/${tutorId}`)
        ]);

        const tutorData = tutorRes.data.tutor || tutorRes.data.data || tutorRes.data;

        // Transform backend response to match frontend interface
        if (tutorData && tutorData.tutorProfile) {
          const transformedTutor: TutorProfile = {
            id: tutorData.tutorProfile.id,
            userId: tutorData.id,
            bio: tutorData.tutorProfile.bio,
            hourlyRate: tutorData.tutorProfile.hourlyRate,
            subjects: tutorData.tutorProfile.subjects || [],
            experience: tutorData.tutorProfile.experience || 0,
            rating: tutorData.tutorProfile.rating || 0,
            reviewCount: tutorData.tutorProfile.reviewCount || 0,
            availability: tutorData.tutorProfile.availability || null,
            user: {
              id: tutorData.id,
              name: tutorData.name,
              email: tutorData.email,
              role: 'TUTOR'
            },
            categories: tutorData.tutorProfile.categories || []
          };
          setTutor(transformedTutor);
        } else {
          setTutor(tutorData);
        }

        setReviews(reviewsRes.data.reviews || reviewsRes.data.data || reviewsRes.data || []);
      } catch (err) {
        console.error('Error fetching tutor:', err);
        if (err && typeof err === 'object' && 'status' in err && err.status === 404) {
          setError('Tutor not found');
        } else {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load tutor profile. Please try again.';
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    if (tutorId) {
      fetchTutorData();
    }
  }, [tutorId]);

  const handleBookingSuccess = () => {
    setShowBookingModal(false);
    // Optionally show success message or redirect
  };

  const handleBookNow = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'STUDENT') {
      showWarning('Only students can book sessions');
      return;
    }
    setShowBookingModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative">
        <Navbar />
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-white/10 rounded w-32" />
            <div className="bg-white/3 backdrop-blur-2xl border border-white/10 rounded-2xl p-8">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="h-48 w-48 bg-white/10 rounded-full mx-auto md:mx-0" />
                <div className="flex-1 space-y-4">
                  <div className="h-10 bg-white/10 rounded w-3/4" />
                  <div className="h-6 bg-white/10 rounded w-1/2" />
                  <div className="h-20 bg-white/10 rounded" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !tutor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative">
        <Navbar />
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button
            onClick={() => router.push('/tutors')}
            className="flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-6 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            Back to Tutors
          </button>
          <ErrorMessage message={error || 'Tutor not found'} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl animate-pulse" />
        </div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full">
          <div
            className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '1s' }}
          />
        </div>
      </div>

      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => router.push('/tutors')}
          className="flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-8 transition-colors opacity-0 animate-fadeInUp"
          style={{ animationDelay: '0.1s' }}
        >
          <ChevronLeft className="h-5 w-5" />
          Back to Tutors
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Header */}
            <div
              className="bg-white/3 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 md:p-8 opacity-0 animate-fadeInUp"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center font-bold text-5xl md:text-7xl text-slate-900 border-4 border-amber-400/30 shrink-0">
                    {tutor.user.name.charAt(0).toUpperCase()}
                  </div>
                  {tutor.rating >= 4.5 && (
                    <div className="absolute -top-2 -right-2 bg-amber-400 rounded-full p-2">
                      <Sparkles className="h-6 w-6 text-slate-900" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {tutor.user.name}
                  </h1>

                  {/* Experience */}
                  <div className="flex items-center justify-center md:justify-start gap-2 text-slate-400 mb-4">
                    <Briefcase className="h-5 w-5 text-amber-400" />
                    <span>
                      {tutor.experience} {tutor.experience === 1 ? 'year' : 'years'} of experience
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-6 w-6 ${
                            i < Math.floor(tutor.rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-amber-400 text-xl font-bold">
                      {tutor.rating.toFixed(1)}
                    </span>
                    <span className="text-slate-500 text-sm">
                      ({tutor.reviewCount} {tutor.reviewCount === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>

                  {/* Categories */}
                  {tutor.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      {tutor.categories.map((category) => (
                        <span
                          key={category.id}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-400/10 text-blue-400 border border-blue-400/20"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* About Section */}
            {tutor.bio && (
              <div
                className="bg-white/3 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 md:p-8 opacity-0 animate-fadeInUp"
                style={{ animationDelay: '0.3s' }}
              >
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <User className="h-6 w-6 text-amber-400" />
                  About
                </h2>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {tutor.bio}
                </p>
              </div>
            )}

            {/* Subjects */}
            <div
              className="bg-white/3 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 md:p-8 opacity-0 animate-fadeInUp"
              style={{ animationDelay: '0.4s' }}
            >
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-amber-400" />
                Subjects
              </h2>
              <div className="flex flex-wrap gap-3">
                {tutor.subjects.map((subject, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-amber-400/10 text-amber-400 border border-amber-400/20"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div
              className="bg-white/3 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 md:p-8 opacity-0 animate-fadeInUp"
              style={{ animationDelay: '0.5s' }}
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-amber-400" />
                Reviews ({reviews.length})
              </h2>

              {reviews.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No reviews yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review, index) => (
                    <div
                      key={review.id}
                      className="pb-6 border-b border-white/10 last:border-b-0 last:pb-0 opacity-0 animate-fadeInUp"
                      style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center font-bold text-slate-900 border-2 border-blue-400/30">
                            {review.student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-semibold">{review.student.name}</p>
                            <p className="text-slate-500 text-xs">
                              {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-slate-300 leading-relaxed">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div
              className="bg-white/3 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 sticky top-24 opacity-0 animate-fadeInUp"
              style={{ animationDelay: '0.6s' }}
            >
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 text-emerald-400 mb-2">
                  <DollarSign className="h-8 w-8" />
                  <span className="text-4xl font-bold">{tutor.hourlyRate}</span>
                  <span className="text-slate-400 text-lg">/hour</span>
                </div>
              </div>

              <Button
                onClick={handleBookNow}
                variant="primary"
                fullWidth
                className="mb-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-bold py-4 text-lg shadow-lg shadow-amber-400/20 hover:shadow-amber-400/40 hover:-translate-y-0.5 transition-all min-h-[56px]"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Book a Session
              </Button>

              {/* Quick Info */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-10 h-10 rounded-full bg-amber-400/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Response Time</p>
                    <p className="font-semibold">Within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-10 h-10 rounded-full bg-amber-400/10 flex items-center justify-center">
                    <Award className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Sessions Completed</p>
                    <p className="font-semibold">{tutor.reviewCount}+</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-10 h-10 rounded-full bg-amber-400/10 flex items-center justify-center">
                    <Star className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Average Rating</p>
                    <p className="font-semibold">{tutor.rating.toFixed(1)} / 5.0</p>
                  </div>
                </div>
              </div>

              {/* Availability Note */}
              {user?.role === 'STUDENT' && (
                <div className="mt-6 p-4 rounded-xl bg-blue-400/10 border border-blue-400/20">
                  <p className="text-blue-400 text-sm text-center">
                    Book now to see available time slots
                  </p>
                </div>
              )}

              {!user && (
                <div className="mt-6 p-4 rounded-xl bg-amber-400/10 border border-amber-400/20">
                  <p className="text-amber-400 text-sm text-center">
                    Please log in as a student to book sessions
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Booking Modal */}
      {showBookingModal && tutor && (
        <BookingModal
          isOpen={showBookingModal}
          tutor={{
            id: tutor.userId,
            name: tutor.user.name,
            tutorProfile: {
              hourlyRate: tutor.hourlyRate,
              subjects: tutor.subjects,
              availability: tutor.availability || []
            }
          }}
          onClose={() => setShowBookingModal(false)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default TutorProfilePage;
