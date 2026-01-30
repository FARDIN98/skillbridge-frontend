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
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600;700&display=swap');

        .homepage {
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          position: relative;
        }

        .homepage::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100vh;
          background: radial-gradient(circle at 20% 50%, rgba(251, 191, 36, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(147, 51, 234, 0.08) 0%, transparent 50%);
          pointer-events: none;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-scale-in {
          animation: scaleIn 0.6s ease-out forwards;
          opacity: 0;
        }

        .hero-title {
          font-family: 'Playfair Display', serif;
          font-weight: 900;
          background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1.1;
        }

        .hero-subtitle {
          color: #94a3b8;
        }

        .search-bar {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .search-bar:focus-within {
          background: rgba(255, 255, 255, 0.08);
          border-color: #fbbf24;
          box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.1);
        }

        .search-input {
          background: transparent;
          border: none;
          outline: none;
          color: #f1f5f9;
          width: 100%;
        }

        .search-input::placeholder {
          color: rgba(241, 245, 249, 0.4);
        }

        .cta-primary {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: #0f172a;
          font-weight: 600;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .cta-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s ease;
        }

        .cta-primary:hover::before {
          left: 100%;
        }

        .cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(251, 191, 36, 0.3);
        }

        .cta-secondary {
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(251, 191, 36, 0.3);
          color: #fbbf24;
          font-weight: 600;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .cta-secondary:hover {
          background: rgba(251, 191, 36, 0.1);
          border-color: #fbbf24;
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(251, 191, 36, 0.2);
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .glass-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(251, 191, 36, 0.3);
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .tutor-card {
          position: relative;
          overflow: hidden;
        }

        .tutor-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #fbbf24, #f59e0b);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .tutor-card:hover::before {
          transform: scaleX(1);
        }

        .category-card {
          cursor: pointer;
          position: relative;
        }

        .category-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(251, 191, 36, 0.05));
          opacity: 0;
          transition: opacity 0.3s ease;
          border-radius: inherit;
        }

        .category-card:hover::after {
          opacity: 1;
        }

        .section-title {
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          color: #ffffff;
        }

        .section-subtitle {
          color: #94a3b8;
        }

        .step-number {
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(251, 191, 36, 0.1));
          border: 2px solid rgba(251, 191, 36, 0.3);
          color: #fbbf24;
          font-family: 'Playfair Display', serif;
          font-weight: 700;
        }

        .stat-number {
          font-family: 'Playfair Display', serif;
          font-weight: 900;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .testimonial-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .avatar-placeholder {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: #0f172a;
          font-weight: 700;
        }

        .badge {
          background: rgba(251, 191, 36, 0.1);
          color: #fbbf24;
          border: 1px solid rgba(251, 191, 36, 0.2);
        }

        .loading-shimmer {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.03) 0%,
            rgba(255, 255, 255, 0.08) 50%,
            rgba(255, 255, 255, 0.03) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>

      <div className="homepage min-h-screen">
        <Navbar />

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-4xl mx-auto">
              <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span className="text-sm text-slate-300">Connect with 500+ Expert Tutors</span>
                </div>
              </div>

              <h1 className="hero-title text-5xl md:text-7xl mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                Connect with Expert Tutors, Learn Anything
              </h1>

              <p className="hero-subtitle text-lg md:text-xl mb-12 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                Find your perfect tutor from thousands of professionals. Master any subject with personalized one-on-one learning.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="search-bar rounded-2xl p-2 flex items-center gap-3">
                  <Search className="h-6 w-6 text-slate-400 ml-4" />
                  <input
                    type="text"
                    placeholder="Search for subjects (e.g., Math, Python, Spanish...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input py-3 text-base"
                  />
                  <button type="submit" className="cta-primary px-8 py-3 rounded-xl flex items-center gap-2 whitespace-nowrap">
                    Search
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </form>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                <Link href="/tutors" className="cta-primary px-8 py-4 rounded-xl inline-flex items-center justify-center gap-2 text-base">
                  Browse Tutors
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link href="/register" className="cta-secondary px-8 py-4 rounded-xl inline-flex items-center justify-center gap-2 text-base">
                  <GraduationCap className="h-5 w-5" />
                  Become a Tutor
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Tutors Section */}
        <section className="py-20 px-4 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="section-title text-4xl md:text-5xl mb-4">Featured Tutors</h2>
              <p className="section-subtitle text-lg">Learn from the best educators in their fields</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="glass-card rounded-2xl p-6 loading-shimmer" style={{ height: '300px' }} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredTutors.map((tutor, index) => (
                  <div
                    key={tutor.id}
                    className="glass-card tutor-card rounded-2xl p-6 animate-scale-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="avatar-placeholder h-16 w-16 rounded-full flex items-center justify-center text-xl flex-shrink-0">
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
                        <span key={i} className="badge text-xs px-3 py-1 rounded-full">
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
              <Link href="/tutors" className="cta-secondary px-8 py-4 rounded-xl inline-flex items-center gap-2">
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
              <h2 className="section-title text-4xl md:text-5xl mb-4">How It Works</h2>
              <p className="section-subtitle text-lg">Start learning in three simple steps</p>
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
                  className="text-center animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="inline-flex items-center justify-center mb-6 relative">
                    <div className="step-number h-20 w-20 rounded-full flex items-center justify-center text-3xl backdrop-blur-xl">
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
              <h2 className="section-title text-4xl md:text-5xl mb-4">Popular Categories</h2>
              <p className="section-subtitle text-lg">Explore subjects across all disciplines</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="glass-card rounded-2xl p-6 loading-shimmer" style={{ height: '160px' }} />
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
                      className="glass-card category-card rounded-2xl p-6 text-center animate-scale-in"
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
            <div className="glass-card rounded-3xl p-12 md:p-16 text-center">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                {[
                  { number: '500+', label: 'Expert Tutors', icon: Users },
                  { number: '10K+', label: 'Students', icon: GraduationCap },
                  { number: '50K+', label: 'Sessions Completed', icon: CheckCircle2 },
                  { number: '4.9', label: 'Average Rating', icon: TrendingUp }
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <stat.icon className="h-8 w-8 text-amber-400 mx-auto mb-3" />
                    <div className="stat-number text-4xl md:text-5xl font-bold mb-2">
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
              <h2 className="section-title text-4xl md:text-5xl mb-4">What Students Say</h2>
              <p className="section-subtitle text-lg">Real feedback from our learning community</p>
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
                  className="testimonial-card rounded-2xl p-8 animate-fade-in-up backdrop-blur-xl"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <Quote className="h-10 w-10 text-amber-400 mb-4 opacity-50" />
                  <p className="text-slate-300 mb-6 text-base leading-relaxed">"{testimonial.text}"</p>
                  <div className="flex items-center gap-4">
                    <div className="avatar-placeholder h-12 w-12 rounded-full flex items-center justify-center text-sm flex-shrink-0">
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
            <div className="glass-card rounded-3xl p-12 md:p-16">
              <Sparkles className="h-16 w-16 text-amber-400 mx-auto mb-6" />
              <h2 className="section-title text-3xl md:text-4xl mb-4">
                Ready to Start Learning?
              </h2>
              <p className="section-subtitle text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of students already learning with expert tutors on SkillBridge
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register" className="cta-primary px-10 py-4 rounded-xl inline-flex items-center justify-center gap-2 text-lg">
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link href="/tutors" className="cta-secondary px-10 py-4 rounded-xl inline-flex items-center justify-center gap-2 text-lg">
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
