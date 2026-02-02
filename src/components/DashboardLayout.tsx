'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { LoadingPage } from './LoadingPage';
import ErrorBoundary from './ErrorBoundary';
import {
  LayoutDashboard,
  Calendar,
  User,
  LogOut,
  Menu,
  X,
  BookOpen,
  Clock,
  GraduationCap,
  Layers,
  Users
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles?: ('STUDENT' | 'TUTOR' | 'ADMIN')[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  allowedRoles = ['STUDENT']
}) => {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Protection: Redirect if not authenticated or wrong role
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!allowedRoles.includes(user.role as any)) {
        // Redirect to appropriate dashboard based on role
        if (user.role === 'ADMIN') {
          router.push('/admin');
        } else if (user.role === 'TUTOR') {
          router.push('/tutor/dashboard');
        } else {
          router.push('/dashboard');
        }
      }
    }
  }, [user, loading, router, allowedRoles]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  // Close sidebar on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen]);

  // Show loading state
  if (loading || !user) {
    return <LoadingPage message="Loading dashboard..." />;
  }

  // Navigation items based on role
  const getNavItems = () => {
    if (user.role === 'STUDENT') {
      return [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/bookings', label: 'My Bookings', icon: Calendar },
        { href: '/dashboard/profile', label: 'Profile', icon: User },
      ];
    }
    if (user.role === 'TUTOR') {
      return [
        { href: '/tutor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/tutor/profile', label: 'Profile', icon: GraduationCap },
        { href: '/tutor/availability', label: 'Availability', icon: Clock },
        { href: '/tutor/sessions', label: 'Sessions', icon: Calendar },
      ];
    }
    if (user.role === 'ADMIN') {
      return [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/users', label: 'Users', icon: Users },
        { href: '/admin/bookings', label: 'Bookings', icon: Calendar },
        { href: '/admin/categories', label: 'Categories', icon: Layers },
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
  };

  // Get accent color based on role
  const getAccentColors = () => {
    if (user.role === 'STUDENT') {
      return {
        text: 'text-blue-400',
        bg: 'bg-blue-400',
        bgHover: 'hover:bg-blue-500',
        border: 'border-blue-400',
        ring: 'focus:ring-blue-400',
        bgOpacity: 'bg-blue-400/10',
        borderOpacity: 'border-blue-400/30',
        shadow: 'shadow-blue-500/20'
      };
    }
    if (user.role === 'TUTOR') {
      return {
        text: 'text-green-400',
        bg: 'bg-green-400',
        bgHover: 'hover:bg-green-500',
        border: 'border-green-400',
        ring: 'focus:ring-green-400',
        bgOpacity: 'bg-green-400/10',
        borderOpacity: 'border-green-400/30',
        shadow: 'shadow-green-500/20'
      };
    }
    // Admin
    return {
      text: 'text-red-400',
      bg: 'bg-red-400',
      bgHover: 'hover:bg-red-500',
      border: 'border-red-400',
      ring: 'focus:ring-red-400',
      bgOpacity: 'bg-red-400/10',
      borderOpacity: 'border-red-400/30',
      shadow: 'shadow-red-500/20'
    };
  };

  const colors = getAccentColors();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative">
      {/* Animated background gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full">
          <div className={`absolute top-1/3 left-1/3 w-96 h-96 ${colors.bgOpacity} rounded-full blur-3xl animate-pulse`} />
        </div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full">
          <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      </div>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-white/10">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className={`flex items-center gap-2 ${colors.text} focus:outline-none ${colors.ring} focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 rounded-lg px-2`}
          >
            <BookOpen className="h-6 w-6" />
            <span className="text-xl font-bold">SkillBridge</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-lg ${colors.text} ${colors.bgOpacity} ${colors.borderOpacity} border transition-all hover:scale-105 min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none ${colors.ring} focus:ring-2`}
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar - Slide from left */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-slate-900/98 backdrop-blur-xl border-r border-white/10 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <Link
            href="/"
            className={`flex items-center gap-3 mb-8 ${colors.text} focus:outline-none ${colors.ring} focus:ring-2 rounded-lg px-2`}
          >
            <BookOpen className="h-8 w-8" />
            <span className="text-2xl font-bold">SkillBridge</span>
          </Link>

          {/* User Info */}
          <div className={`mb-8 p-4 rounded-xl bg-gradient-to-br from-${colors.bgOpacity} to-purple-500/10 ${colors.borderOpacity} border`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-${colors.bg} to-${colors.bgHover.replace('hover:', '')} flex items-center justify-center font-bold text-slate-900 ${colors.borderOpacity} border-2`}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{user.name}</p>
                <p className="text-slate-400 text-xs truncate">{user.email}</p>
                <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${colors.bgOpacity} ${colors.text} ${colors.borderOpacity} border`}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all min-h-[44px] focus:outline-none ${colors.ring} focus:ring-2 ${
                    isActive
                      ? `${colors.bgOpacity} ${colors.text} shadow-lg ${colors.shadow} border-l-4 ${colors.border}`
                      : 'text-slate-300 hover:text-white hover:bg-white/5 hover:translate-x-1'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all hover:translate-x-1 min-h-[44px] w-full text-left mt-4 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed left-0 top-0 w-64 h-screen bg-white/5 backdrop-blur-xl border-r border-white/10 shadow-xl overflow-y-auto">
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <Link
            href="/"
            className={`flex items-center gap-3 mb-8 ${colors.text} focus:outline-none ${colors.ring} focus:ring-2 rounded-lg px-2`}
          >
            <BookOpen className="h-8 w-8" />
            <span className="text-2xl font-bold">SkillBridge</span>
          </Link>

          {/* User Info */}
          <div className={`mb-8 p-4 rounded-xl bg-gradient-to-br ${colors.bgOpacity} to-purple-500/10 ${colors.borderOpacity} border`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${colors.bg} flex items-center justify-center font-bold text-slate-900 ${colors.borderOpacity} border-2`}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{user.name}</p>
                <p className="text-slate-400 text-xs truncate">{user.email}</p>
                <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${colors.bgOpacity} ${colors.text} ${colors.borderOpacity} border`}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all focus:outline-none ${colors.ring} focus:ring-2 ${
                    isActive
                      ? `${colors.bgOpacity} ${colors.text} shadow-lg ${colors.shadow} border-l-4 ${colors.border}`
                      : 'text-slate-300 hover:text-white hover:bg-white/5 hover:translate-x-1'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all hover:translate-x-1 w-full text-left mt-4 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main id="main-content" className="md:ml-64 min-h-screen">
        <div className="relative z-10 p-4 md:p-8">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
