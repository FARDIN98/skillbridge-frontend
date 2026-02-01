'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../src/components/Navbar';
import Footer from '../src/components/Footer';
import StarRating from '../src/components/StarRating';
import api from '../src/lib/api';
import {
  Search,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Code,
  Calculator,
  Languages,
  Microscope,
  Music,
  Palette,
  Briefcase,
  Users,
  GraduationCap,
  TrendingUp,
  Sparkles,
  Quote
} from 'lucide-react';

interface Tutor {
  id: string;
  name: string;
  email: string;
  tutorProfile?: {
    bio?: string;
    hourlyRate: number;
    subjects: string[];
    rating: number;
    reviewCount: number;
  };
}

interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const categoryIcons: { [key: string]: any } = {
  'mathematics': Calculator,
  'programming': Code,
  'languages': Languages,
  'science': Microscope,
  'music': Music,
  'art': Palette,
  'business': Briefcase
};

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredTutors, setFeaturedTutors] = useState<Tutor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tutorsResponse, categoriesResponse] = await Promise.all([
          api.get('/tutors?limit=6'),
          api.get('/categories')
        ]);

        setFeaturedTutors(tutorsResponse.data.tutors || []);
        const categoriesData = categoriesResponse.data;
        setCategories(Array.isArray(categoriesData) ? categoriesData : (categoriesData?.categories || []));
      } catch (error) {
        console.error('Failed to fetch homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/tutors?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative">
        {/* Background decorative gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-[20%] w-96 h-96 bg-amber-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-[20%] w-80 h-80 bg-purple-600/8 rounded-full blur-3xl" />
        </div>

        <Navbar />

        {/* Hero Section */}
        <section className="relative pt-24 sm:pt-32 lg:pt-40 pb-16 sm:pb-20 lg:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.1s_forwards]">
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 mb-6">
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-slate-300 font-medium">Connect with 500+ Expert Tutors</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-4 sm:mb-6 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards] bg-gradient-to-br from-white via-white to-slate-300 bg-clip-text text-transparent leading-tight tracking-tight">
                Connect with Expert Tutors, Learn Anything
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-400 mb-8 sm:mb-10 lg:mb-12 max-w-2xl mx-auto opacity-0 animate-[fadeInUp_0.8s_ease-out_0.3s_forwards] leading-relaxed px-2">
                Find your perfect tutor from thousands of professionals. Master any subject with personalized one-on-one learning.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6 sm:mb-8 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.4s_forwards]">
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 transition-all duration-300 focus-within:bg-white/8 focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-400/10">
                  <div className="flex items-center gap-3 flex-1 px-2 sm:px-3">
                    <Search className="h-5 w-5 sm:h-6 sm:w-6 text-slate-400 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Search subjects (Math, Python, Spanish...)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent border-none outline-none text-slate-100 placeholder:text-slate-500 w-full py-2 sm:py-3 text-sm sm:text-base"
                      aria-label="Search for subjects"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-semibold px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-500/30 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-950 min-h-[44px] relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                    <span className="relative">Search</span>
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 relative" />
                  </button>
                </div>
              </form>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center opacity-0 animate-[fadeInUp_0.8s_ease-out_0.5s_forwards] max-w-md sm:max-w-none mx-auto">
                <Link
                  href="/tutors"
                  className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-semibold px-8 py-4 rounded-xl inline-flex items-center justify-center gap-2 text-sm sm:text-base transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-500/30 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-950 min-h-[44px] relative overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                  <span className="relative">Browse Tutors</span>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 relative" />
                </Link>
                <Link
                  href="/register"
                  className="bg-white/5 backdrop-blur-xl border-2 border-amber-400/30 text-amber-400 font-semibold px-8 py-4 rounded-xl inline-flex items-center justify-center gap-2 text-sm sm:text-base transition-all duration-300 hover:bg-amber-400/10 hover:border-amber-400 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-500/20 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-950 min-h-[44px]"
                >
                  <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Become a Tutor</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Tutors Section */}
        <section className="py-20 px-4 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">Featured Tutors</h2>
              <p className="text-base sm:text-lg text-slate-400">Learn from the best educators in their fields</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white/3 backdrop-blur-2xl border border-white/10 rounded-2xl transition-all duration-300 hover:bg-white/5 hover:border-amber-400/30 p-6 animate-shimmer" style={{ height: '300px' }} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredTutors.map((tutor, index) => (
                  <div
                    key={tutor.id}
                    className="bg-white/3 backdrop-blur-2xl border border-white/10 rounded-2xl transition-all duration-300 hover:bg-white/5 hover:border-amber-400/30 p-6 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-amber-400 before:to-amber-500 before:scale-x-0 before:transition-transform before:duration-300 hover:before:scale-x-100 hover:-translate-y-2 hover:shadow-xl hover:shadow-black/30 opacity-0 animate-[scaleIn_0.6s_ease-out_forwards]"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="bg-gradient-to-br from-amber-400 to-amber-500 text-slate-900 font-bold h-16 w-16 rounded-full flex items-center justify-center text-xl flex-shrink-0">
                        {tutor.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-lg mb-1">{tutor.name}</h3>
                        <div className="flex items-center gap-2">
                          <StarRating rating={tutor.tutorProfile?.rating || 0} size="sm" />
                          <span className="text-slate-400 text-sm">
                            ({tutor.tutorProfile?.reviewCount || 0})
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                      {tutor.tutorProfile?.bio || 'Experienced tutor ready to help you succeed.'}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {tutor.tutorProfile?.subjects.slice(0, 3).map((subject, i) => (
                        <span key={i} className="bg-amber-400/10 text-amber-400 border border-amber-400/20 text-xs px-3 py-1 rounded-full">
                          {subject}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                      <div>
                        <span className="text-2xl font-bold text-amber-400">
                          ${tutor.tutorProfile?.hourlyRate || 0}
                        </span>
                        <span className="text-slate-400 text-sm">/hour</span>
                      </div>
                      <Link
                        href={`/tutors/${tutor.id}`}
                        className="text-amber-400 hover:text-amber-300 font-medium text-sm flex items-center gap-1"
                      >
                        View Profile
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="text-center mt-12">
              <Link href="/tutors" className="bg-white/5 backdrop-blur-xl border-2 border-amber-400/30 text-amber-400 font-semibold transition-all duration-300 hover:bg-amber-400/10 hover:border-amber-400 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-500/20 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-950 min-h-[44px] px-8 py-4 rounded-xl inline-flex items-center gap-2">
                View All Tutors
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-4 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">How It Works</h2>
              <p className="text-base sm:text-lg text-slate-400">Start learning in three simple steps</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {[
                {
                  number: '01',
                  icon: Search,
                  title: 'Browse',
                  description: 'Search and filter through hundreds of qualified tutors to find your perfect match'
                },
                {
                  number: '02',
                  icon: Calendar,
                  title: 'Book',
                  description: 'Schedule sessions at times that work for you with our easy booking system'
                },
                {
                  number: '03',
                  icon: CheckCircle2,
                  title: 'Learn',
                  description: 'Connect with your tutor and start achieving your learning goals'
                }
              ].map((step, index) => (
                <div
                  key={index}
                  className="text-center opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards]"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="inline-flex items-center justify-center mb-6 relative">
                    <div className="bg-gradient-to-br from-amber-400/20 to-amber-400/10 border-2 border-amber-400/30 text-amber-400 font-bold backdrop-blur-xl h-20 w-20 rounded-full flex items-center justify-center text-3xl">
                      {step.number}
                    </div>
                    <div className="absolute inset-0 rounded-full bg-amber-400 opacity-20 blur-xl animate-pulse" />
                  </div>
                  <step.icon className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                  <h3 className="text-white text-2xl font-bold mb-3">{step.title}</h3>
                  <p className="text-slate-400">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 px-4 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">Popular Categories</h2>
              <p className="text-base sm:text-lg text-slate-400">Explore subjects across all disciplines</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white/3 backdrop-blur-2xl border border-white/10 rounded-2xl transition-all duration-300 hover:bg-white/5 hover:border-amber-400/30 p-6 animate-shimmer" style={{ height: '160px' }} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.isArray(categories) && categories.map((category, index) => {
                  const Icon = categoryIcons[category.slug] || BookOpen;
                  return (
                    <Link
                      key={category.id}
                      href={`/tutors?category=${category.slug}`}
                      className="bg-white/3 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 text-center transition-all duration-300 hover:bg-white/5 hover:border-amber-400/30 cursor-pointer relative after:absolute after:inset-0 after:bg-gradient-to-br after:from-amber-400/10 after:to-amber-400/5 after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-300 after:rounded-2xl opacity-0 animate-[scaleIn_0.6s_ease-out_forwards]"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <Icon className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                      <h3 className="text-white font-semibold text-lg mb-2">{category.name}</h3>
                      <p className="text-slate-400 text-sm">{category.description || 'Explore courses'}</p>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-4 relative">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/3 backdrop-blur-2xl border border-white/10 rounded-3xl transition-all duration-300 hover:bg-white/5 hover:border-amber-400/30 p-12 md:p-16 text-center">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                {[
                  { number: '500+', label: 'Expert Tutors', icon: Users },
                  { number: '10K+', label: 'Students', icon: GraduationCap },
                  { number: '50K+', label: 'Sessions Completed', icon: CheckCircle2 },
                  { number: '4.9', label: 'Average Rating', icon: TrendingUp }
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards]"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <stat.icon className="h-8 w-8 text-amber-400 mx-auto mb-3" />
                    <div className="font-black bg-gradient-to-br from-amber-400 to-amber-500 bg-clip-text text-transparent text-4xl md:text-5xl mb-2">
                      {stat.number}
                    </div>
                    <div className="text-slate-400 text-sm md:text-base">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-4 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">What Students Say</h2>
              <p className="text-base sm:text-lg text-slate-400">Real feedback from our learning community</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Sarah Johnson',
                  role: 'College Student',
                  text: 'SkillBridge helped me find the perfect math tutor. My grades improved from C to A in just two months!',
                  rating: 5
                },
                {
                  name: 'Michael Chen',
                  role: 'Professional',
                  text: 'Learning Python here changed my career. The tutors are knowledgeable and patient.',
                  rating: 5
                },
                {
                  name: 'Emily Rodriguez',
                  role: 'High School Student',
                  text: 'The chemistry tutor I found here made complex topics so easy to understand. Highly recommend!',
                  rating: 5
                }
              ].map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-white/2 border border-white/8 backdrop-blur-xl rounded-2xl p-8 opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards]"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <Quote className="h-10 w-10 text-amber-400 mb-4 opacity-50" />
                  <p className="text-slate-300 mb-6 text-base leading-relaxed">"{testimonial.text}"</p>
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-amber-400 to-amber-500 text-slate-900 font-bold h-12 w-12 rounded-full flex items-center justify-center text-sm flex-shrink-0">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold">{testimonial.name}</div>
                      <div className="text-slate-400 text-sm">{testimonial.role}</div>
                    </div>
                    <StarRating rating={testimonial.rating} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white/3 backdrop-blur-2xl border border-white/10 rounded-3xl transition-all duration-300 hover:bg-white/5 hover:border-amber-400/30 p-12 md:p-16">
              <Sparkles className="h-16 w-16 text-amber-400 mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                Ready to Start Learning?
              </h2>
              <p className="text-base sm:text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
                Join thousands of students already learning with expert tutors on SkillBridge
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register" className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-500/30 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-950 min-h-[44px] relative overflow-hidden group px-10 py-4 rounded-xl inline-flex items-center justify-center gap-2 text-lg">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                  <span className="relative">Get Started Free</span>
                  <ArrowRight className="h-5 w-5 relative" />
                </Link>
                <Link href="/tutors" className="bg-white/5 backdrop-blur-xl border-2 border-amber-400/30 text-amber-400 font-semibold transition-all duration-300 hover:bg-amber-400/10 hover:border-amber-400 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-500/20 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-950 min-h-[44px] px-10 py-4 rounded-xl inline-flex items-center justify-center gap-2 text-lg">
                  Explore Tutors
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
