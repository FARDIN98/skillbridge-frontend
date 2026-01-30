'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, BookOpen, LogOut, User, LayoutDashboard } from 'lucide-react';
import Button from './Button';

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

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-blue-600 hover:text-blue-700">
            <BookOpen className="h-7 w-7" />
            <span>SkillBridge</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Home
            </Link>
            <Link
              href="/tutors"
              className={`text-sm font-medium transition-colors ${
                isActive('/tutors') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Find Tutors
            </Link>

            {isAuthenticated && user ? (
              <>
                <Link
                  href={getDashboardLink()}
                  className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                    pathname.startsWith('/dashboard') || pathname.startsWith('/tutor') || pathname.startsWith('/admin')
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>

                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">{user.name}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {user.role}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="flex items-center gap-1"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-3">
            <Link
              href="/"
              className={`block px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/tutors"
              className={`block px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/tutors') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Find Tutors
            </Link>

            {isAuthenticated && user ? (
              <>
                <Link
                  href={getDashboardLink()}
                  className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>

                <div className="px-3 py-2 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>

                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" fullWidth>
                    Login
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" fullWidth>
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
