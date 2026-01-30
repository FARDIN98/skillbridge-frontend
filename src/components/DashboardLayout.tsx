'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  User,
  LogOut,
  Menu,
  X,
  BookOpen,
  Sparkles
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

  // Show loading state
  if (loading || !user) {
    return (
      <>
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600&display=swap');

          .loading-screen {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .loading-spinner {
            width: 50px;
            height: 50px;
            border: 3px solid rgba(251, 191, 36, 0.1);
            border-top-color: #fbbf24;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div className="loading-screen">
          <div className="loading-spinner" />
        </div>
      </>
    );
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
    return [];
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600&display=swap');

        .dashboard-layout {
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          min-height: 100vh;
          position: relative;
        }

        .dashboard-layout::before {
          content: '';
          position: fixed;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at 30% 50%, rgba(251, 191, 36, 0.08) 0%, transparent 50%),
                      radial-gradient(circle at 70% 60%, rgba(147, 51, 234, 0.06) 0%, transparent 50%);
          animation: float 20s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(5deg); }
          66% { transform: translate(-20px, 20px) rotate(-5deg); }
        }

        .sidebar {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }

        .sidebar-logo {
          font-family: 'Playfair Display', serif;
          font-weight: 900;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #fbbf24 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .user-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 18px;
          color: #0f172a;
          border: 2px solid rgba(251, 191, 36, 0.3);
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          color: #cbd5e1;
          transition: all 0.3s ease;
          text-decoration: none;
          position: relative;
        }

        .nav-item:hover {
          background: rgba(251, 191, 36, 0.1);
          color: #fbbf24;
          transform: translateX(4px);
        }

        .nav-item.active {
          background: rgba(251, 191, 36, 0.15);
          color: #fbbf24;
          box-shadow: 0 0 20px rgba(251, 191, 36, 0.2);
        }

        .nav-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 70%;
          background: #fbbf24;
          border-radius: 0 2px 2px 0;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          color: #f87171;
          transition: all 0.3s ease;
          cursor: pointer;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
        }

        .logout-btn:hover {
          background: rgba(248, 113, 113, 0.1);
          transform: translateX(4px);
        }

        .mobile-header {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .hamburger-btn {
          background: rgba(251, 191, 36, 0.1);
          color: #fbbf24;
          border: 1px solid rgba(251, 191, 36, 0.3);
          padding: 8px;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .hamburger-btn:hover {
          background: rgba(251, 191, 36, 0.2);
          transform: scale(1.05);
        }

        .mobile-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: 280px;
          height: 100vh;
          background: rgba(15, 23, 42, 0.98);
          backdrop-filter: blur(20px);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
          transform: translateX(-100%);
          transition: transform 0.3s ease;
          z-index: 1000;
        }

        .mobile-sidebar.open {
          transform: translateX(0);
        }

        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.5);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
          z-index: 999;
        }

        .sidebar-overlay.open {
          opacity: 1;
          pointer-events: auto;
        }

        .content-area {
          background: transparent;
        }

        @media (max-width: 768px) {
          .desktop-sidebar {
            display: none;
          }
        }

        @media (min-width: 769px) {
          .mobile-header {
            display: none;
          }
          .mobile-sidebar {
            display: none;
          }
        }
      `}</style>

      <div className="dashboard-layout">
        {/* Mobile Header */}
        <div className="mobile-header sticky top-0 z-50 px-4 py-3 flex items-center justify-between md:hidden">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-amber-400" />
            <span className="sidebar-logo text-xl">SkillBridge</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hamburger-btn"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Overlay */}
        <div
          className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Mobile Sidebar */}
        <aside className={`mobile-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="p-6 flex flex-col h-full">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 mb-8">
              <div className="relative">
                <BookOpen className="h-8 w-8 text-amber-400" />
                <Sparkles className="h-3 w-3 text-amber-400 absolute -top-1 -right-1" />
              </div>
              <span className="sidebar-logo text-2xl">SkillBridge</span>
            </Link>

            {/* User Info */}
            <div className="mb-8 p-4 rounded-xl bg-gradient-to-br from-amber-400/10 to-purple-500/10 border border-amber-400/20">
              <div className="flex items-center gap-3">
                <div className="user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{user.name}</p>
                  <p className="text-slate-400 text-xs truncate">{user.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/30">
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
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon size={20} />
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <button onClick={handleLogout} className="logout-btn mt-4">
              <LogOut size={20} />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </div>
        </aside>

        {/* Desktop Sidebar */}
        <aside className="desktop-sidebar sidebar fixed left-0 top-0 w-64 h-screen overflow-y-auto hidden md:block">
          <div className="p-6 flex flex-col h-full">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 mb-8">
              <div className="relative">
                <BookOpen className="h-8 w-8 text-amber-400" />
                <Sparkles className="h-3 w-3 text-amber-400 absolute -top-1 -right-1" />
              </div>
              <span className="sidebar-logo text-2xl">SkillBridge</span>
            </Link>

            {/* User Info */}
            <div className="mb-8 p-4 rounded-xl bg-gradient-to-br from-amber-400/10 to-purple-500/10 border border-amber-400/20">
              <div className="flex items-center gap-3">
                <div className="user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{user.name}</p>
                  <p className="text-slate-400 text-xs truncate">{user.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/30">
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
                    className={`nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={20} />
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <button onClick={handleLogout} className="logout-btn mt-4">
              <LogOut size={20} />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="content-area md:ml-64 min-h-screen">
          <div className="relative z-10 p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </>
  );
};

export default DashboardLayout;
