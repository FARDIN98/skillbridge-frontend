'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Star,
  BookOpen,
  DollarSign,
  Users,
  Sparkles,
  ChevronDown,
  X
} from 'lucide-react';
import api from '../../src/lib/api';
import Navbar from '../../src/components/Navbar';
import Footer from '../../src/components/Footer';
import LoadingSpinner from '../../src/components/LoadingSpinner';
import ErrorMessage from '../../src/components/ErrorMessage';

interface TutorProfile {
  id: string;
  userId: string;
  bio: string | null;
  hourlyRate: number;
  subjects: string[];
  experience: number;
  rating: number;
  reviewCount: number;
  user: {
    id: string;
    name: string;
    email: string;
  };
  categories: {
    id: string;
    name: string;
    slug: string;
  }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

type SortOption = 'rating-desc' | 'price-asc' | 'price-desc' | 'newest';

const TutorsPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [minRating, setMinRating] = useState(Number(searchParams.get('minRating')) || 0);
  const [priceRange, setPriceRange] = useState({
    min: Number(searchParams.get('minPrice')) || 0,
    max: Number(searchParams.get('maxPrice')) || 500
  });
  const [sortBy, setSortBy] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'rating-desc');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch categories and tutors
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [tutorsRes, categoriesRes] = await Promise.all([
          api.get('/tutors'),
          api.get('/categories')
        ]);

        // Ensure we always set arrays
        const tutorsData = tutorsRes.data.tutors || tutorsRes.data.data || tutorsRes.data || [];
        const categoriesData = categoriesRes.data.data || categoriesRes.data || [];

        setTutors(Array.isArray(tutorsData) ? tutorsData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load tutors. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort tutors
  const filteredTutors = tutors
    .filter((tutor) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        tutor.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutor.subjects.some((subject) =>
          subject.toLowerCase().includes(searchQuery.toLowerCase())
        );

      // Category filter
      const matchesCategory =
        !selectedCategory ||
        tutor.categories.some((cat) => cat.slug === selectedCategory);

      // Rating filter
      const matchesRating = tutor.rating >= minRating;

      // Price filter
      const matchesPrice =
        tutor.hourlyRate >= priceRange.min && tutor.hourlyRate <= priceRange.max;

      return matchesSearch && matchesCategory && matchesRating && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating-desc':
          return b.rating - a.rating;
        case 'price-asc':
          return a.hourlyRate - b.hourlyRate;
        case 'price-desc':
          return b.hourlyRate - a.hourlyRate;
        case 'newest':
          return 0; // Would need createdAt field
        default:
          return 0;
      }
    });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setMinRating(0);
    setPriceRange({ min: 0, max: 500 });
    setSortBy('rating-desc');
    router.push('/tutors');
  };

  const hasActiveFilters =
    searchQuery || selectedCategory || minRating > 0 || priceRange.min > 0 || priceRange.max < 500;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        </div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full">
          <div
            className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '1s' }}
          />
        </div>
      </div>

      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 opacity-0 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center gap-3">
            <BookOpen className="h-10 w-10 text-amber-400" />
            Browse Tutors
          </h1>
          <p className="text-slate-400 text-lg">
            Find the perfect tutor for your learning journey
          </p>
        </div>

        {/* Search and Sort Bar */}
        <div
          className="mb-6 flex flex-col sm:flex-row gap-4 opacity-0 animate-fadeInUp"
          style={{ animationDelay: '0.2s' }}
        >
          {/* Search */}
          <div className="flex-1 flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 transition-all duration-300 focus-within:bg-white/8 focus-within:border-amber-400 focus-within:ring-3 focus-within:ring-amber-400/10">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-slate-100 text-sm placeholder:text-slate-500"
            />
          </div>

          {/* Sort */}
          <div className="relative sm:w-64">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-100 text-sm appearance-none cursor-pointer transition-all duration-300 hover:bg-white/8 hover:border-amber-400/30 pr-10"
            >
              <option value="rating-desc" className="bg-slate-900">Highest Rated</option>
              <option value="price-asc" className="bg-slate-900">Price: Low to High</option>
              <option value="price-desc" className="bg-slate-900">Price: High to Low</option>
              <option value="newest" className="bg-slate-900">Newest</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
          </div>

          {/* Toggle Filters Button (Mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-amber-400/10 border border-amber-400/30 text-amber-400 hover:bg-amber-400/20 transition-all"
          >
            <SlidersHorizontal className="h-5 w-5" />
            Filters
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside
            className={`lg:block lg:w-80 space-y-6 opacity-0 animate-fadeInUp ${
              showFilters ? 'block' : 'hidden'
            }`}
            style={{ animationDelay: '0.3s' }}
          >
            <div className="bg-white/3 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Filter className="h-5 w-5 text-amber-400" />
                  Filters
                </h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-100 text-sm appearance-none cursor-pointer transition-all duration-300 hover:bg-white/8 hover:border-amber-400/30"
                >
                  <option value="" className="bg-slate-900">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug} className="bg-slate-900">
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Minimum Rating Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Minimum Rating
                </label>
                <div className="space-y-2">
                  {[4, 3, 2, 1, 0].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        minRating === rating
                          ? 'bg-amber-400/20 border border-amber-400/30 text-amber-400'
                          : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/8'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                      {rating > 0 ? `${rating}+ Stars` : 'All Ratings'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Price Range ($/hour)
                </label>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Min: ${priceRange.min}</label>
                    <input
                      type="range"
                      min="0"
                      max="500"
                      step="10"
                      value={priceRange.min}
                      onChange={(e) =>
                        setPriceRange((prev) => ({ ...prev, min: Number(e.target.value) }))
                      }
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Max: ${priceRange.max}</label>
                    <input
                      type="range"
                      min="0"
                      max="500"
                      step="10"
                      value={priceRange.max}
                      onChange={(e) =>
                        setPriceRange((prev) => ({ ...prev, max: Number(e.target.value) }))
                      }
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Tutors Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white/3 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 animate-pulse"
                  >
                    <div className="h-20 w-20 bg-white/10 rounded-full mx-auto mb-4" />
                    <div className="h-6 bg-white/10 rounded mb-2" />
                    <div className="h-4 bg-white/10 rounded mb-4" />
                    <div className="flex gap-2 mb-4">
                      <div className="h-6 w-16 bg-white/10 rounded" />
                      <div className="h-6 w-16 bg-white/10 rounded" />
                    </div>
                    <div className="h-10 bg-white/10 rounded" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <ErrorMessage message={error} />
            ) : filteredTutors.length === 0 ? (
              <div
                className="text-center py-16 px-6 opacity-0 animate-fadeInUp"
                style={{ animationDelay: '0.4s' }}
              >
                <Users className="h-16 w-16 mx-auto mb-4 text-slate-500" />
                <h3 className="text-2xl font-bold text-white mb-2">No tutors found</h3>
                <p className="text-slate-400 mb-6">
                  Try adjusting your filters or search query
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 rounded-xl font-semibold bg-amber-400 text-slate-900 hover:bg-amber-500 transition-all"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="mb-6 text-slate-400 text-sm opacity-0 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                  Showing {filteredTutors.length} of {tutors.length} tutors
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredTutors.map((tutor, index) => (
                    <Link
                      key={tutor.id}
                      href={`/tutors/${tutor.userId}`}
                      className="group bg-white/3 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:bg-white/5 hover:border-amber-400/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-400/10 opacity-0 animate-fadeInUp"
                      style={{ animationDelay: `${0.5 + index * 0.05}s` }}
                    >
                      {/* Avatar */}
                      <div className="relative mx-auto mb-4 w-20 h-20">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center font-bold text-2xl text-slate-900 border-2 border-amber-400/30 group-hover:scale-110 transition-transform duration-300">
                          {tutor.user.name.charAt(0).toUpperCase()}
                        </div>
                        {tutor.rating >= 4.5 && (
                          <div className="absolute -top-1 -right-1 bg-amber-400 rounded-full p-1">
                            <Sparkles className="h-4 w-4 text-slate-900" />
                          </div>
                        )}
                      </div>

                      {/* Name */}
                      <h3 className="text-xl font-bold text-white mb-1 text-center group-hover:text-amber-400 transition-colors">
                        {tutor.user.name}
                      </h3>

                      {/* Experience */}
                      <p className="text-slate-400 text-sm text-center mb-4">
                        {tutor.experience} {tutor.experience === 1 ? 'year' : 'years'} experience
                      </p>

                      {/* Rating */}
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(tutor.rating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-slate-300 text-sm font-semibold">
                          {tutor.rating.toFixed(1)}
                        </span>
                        <span className="text-slate-500 text-xs">
                          ({tutor.reviewCount} {tutor.reviewCount === 1 ? 'review' : 'reviews'})
                        </span>
                      </div>

                      {/* Subjects */}
                      <div className="flex flex-wrap gap-2 mb-4 justify-center">
                        {tutor.subjects.slice(0, 3).map((subject, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-400/10 text-amber-400 border border-amber-400/20"
                          >
                            {subject}
                          </span>
                        ))}
                        {tutor.subjects.length > 3 && (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-400/10 text-amber-400 border border-amber-400/20">
                            +{tutor.subjects.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-center gap-2 mb-4 text-emerald-400 font-bold text-lg">
                        <DollarSign className="h-5 w-5" />
                        {tutor.hourlyRate}/hr
                      </div>

                      {/* View Profile Button */}
                      <div className="pt-4 border-t border-white/10">
                        <div className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-center bg-amber-400/10 border border-amber-400/30 text-amber-400 group-hover:bg-amber-400 group-hover:text-slate-900 transition-all">
                          View Profile
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const TutorsPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Navbar />
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center min-h-[50vh]">
            <LoadingSpinner />
          </div>
        </main>
        <Footer />
      </div>
    }>
      <TutorsPageContent />
    </Suspense>
  );
};

export default TutorsPage;
