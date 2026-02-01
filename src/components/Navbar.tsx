'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, BookOpen, LogOut, User, LayoutDashboard } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'TUTOR') return '/tutor/dashboard';
    return '/dashboard';
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Close menu on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-amber-400 focus:text-slate-900 focus:rounded-xl focus:font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
      >
        Skip to main content
      </a>

      <nav className="bg-slate-950/95 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 text-xl sm:text-2xl font-bold text-white hover:text-amber-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400/50 rounded-lg px-2 group"
            >
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 group-hover:from-amber-500 group-hover:to-amber-600 transition-all duration-200 shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-slate-900" />
              </div>
              <span className="bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent group-hover:from-amber-400 group-hover:to-amber-500">
                SkillBridge
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {/* Nav Links */}
              <div className="flex items-center gap-1">
                <Link
                  href="/"
                  className={`text-sm font-semibold transition-all duration-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/50 ${
                    isActive('/')
                      ? 'text-amber-400 bg-amber-400/10'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Home
                </Link>
                <Link
                  href="/tutors"
                  className={`text-sm font-semibold transition-all duration-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/50 ${
                    isActive('/tutors')
                      ? 'text-amber-400 bg-amber-400/10'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Find Tutors
                </Link>

                {isAuthenticated && user && (
                  <Link
                    href={getDashboardLink()}
                    className={`flex items-center gap-2 text-sm font-semibold transition-all duration-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/50 ${
                      pathname.startsWith('/dashboard') || pathname.startsWith('/tutor') || pathname.startsWith('/admin')
                        ? 'text-amber-400 bg-amber-400/10'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                )}
              </div>

              {/* Auth Section */}
              {isAuthenticated && user ? (
                <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                  {/* User Profile */}
                  <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-slate-900 font-bold text-sm border-2 border-amber-400/30">
                      {user.name.charAt(0).toUpperCase()}
                    </div>

                    {/* User Info */}
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white leading-tight">{user.name}</span>
                      <span className="text-xs font-medium text-amber-400 leading-tight">
                        {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                      </span>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-red-400 transition-all px-3 py-2 rounded-lg hover:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-red-400/50 border border-transparent hover:border-red-500/30"
                    aria-label="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5 border border-white/10 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm font-semibold bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 px-5 py-2 rounded-lg hover:from-amber-500 hover:to-amber-600 transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-950"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-950"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Navigation - Slide in from right */}
      <div
        className={`fixed inset-y-0 right-0 w-72 bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile menu header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <span className="text-lg font-bold text-amber-400">Menu</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-amber-400"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile menu links */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-2">
            <Link
              href="/"
              className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors min-h-[44px] flex items-center focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                isActive('/') ? 'bg-amber-400/10 text-amber-400' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Home
            </Link>
            <Link
              href="/tutors"
              className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors min-h-[44px] flex items-center focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                isActive('/tutors') ? 'bg-amber-400/10 text-amber-400' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Find Tutors
            </Link>

            {isAuthenticated && user ? (
              <>
                <Link
                  href={getDashboardLink()}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors min-h-[44px] focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Dashboard
                </Link>

                <div className="px-4 py-4 mt-4 border-t border-white/10 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-400/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-white">{user.name}</p>
                      <p className="text-sm text-slate-400">{user.role}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-base font-medium text-red-400 hover:bg-red-500/10 transition-colors min-h-[44px] mt-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-4 py-3 rounded-xl text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-center min-h-[44px] flex items-center justify-center mt-4 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-3 rounded-xl text-base font-medium bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 hover:from-amber-500 hover:to-amber-600 transition-all shadow-lg shadow-amber-500/20 text-center min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
