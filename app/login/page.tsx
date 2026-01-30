'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/contexts/AuthContext';
import ErrorMessage from '../../src/components/ErrorMessage';
import { LoadingButton } from '../../src/components/ButtonSpinner';
import { BookOpen, Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { login, isAuthenticated, user, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN') {
        router.push('/admin');
      } else if (user.role === 'TUTOR') {
        router.push('/tutor/dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login({ email: formData.email, password: formData.password });
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600&display=swap');

        .login-page {
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          position: relative;
          overflow: hidden;
        }

        .login-page::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at 30% 50%, rgba(251, 191, 36, 0.08) 0%, transparent 50%),
                      radial-gradient(circle at 70% 60%, rgba(147, 51, 234, 0.06) 0%, transparent 50%),
                      radial-gradient(circle at 50% 30%, rgba(59, 130, 246, 0.05) 0%, transparent 50%);
          animation: float 20s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(5deg); }
          66% { transform: translate(-20px, 20px) rotate(-5deg); }
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

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .logo-text {
          font-family: 'Playfair Display', serif;
          font-weight: 900;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #fbbf24 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow:
            0 8px 32px 0 rgba(0, 0, 0, 0.37),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
        }

        .input-wrapper {
          position: relative;
          transition: all 0.3s ease;
        }

        .input-field {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #f1f5f9;
          transition: all 0.3s ease;
        }

        .input-field:focus {
          background: rgba(255, 255, 255, 0.08);
          border-color: #fbbf24;
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
          outline: none;
        }

        .input-field::placeholder {
          color: rgba(241, 245, 249, 0.4);
        }

        .input-icon {
          color: rgba(241, 245, 249, 0.4);
          transition: all 0.3s ease;
        }

        .input-wrapper:focus-within .input-icon {
          color: #fbbf24;
        }

        .submit-btn {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: #0f172a;
          font-weight: 600;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .submit-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s ease;
        }

        .submit-btn:hover::before {
          left: 100%;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(251, 191, 36, 0.3);
        }

        .submit-btn:active {
          transform: translateY(0);
        }

        .demo-card {
          background: rgba(251, 191, 36, 0.05);
          border: 1px solid rgba(251, 191, 36, 0.2);
          backdrop-filter: blur(10px);
        }

        .link-text {
          color: #fbbf24;
          transition: all 0.3s ease;
          position: relative;
        }

        .link-text::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: #fbbf24;
          transition: width 0.3s ease;
        }

        .link-text:hover::after {
          width: 100%;
        }

        .sparkle-icon {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>

      <div className="login-page min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full relative z-10">
          {/* Logo and Header */}
          <div className="text-center mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
            <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
              <div className="relative">
                <BookOpen className="h-10 w-10 text-amber-400 transition-transform group-hover:scale-110" />
                <Sparkles className="h-4 w-4 text-amber-400 absolute -top-1 -right-1 sparkle-icon" />
              </div>
              <span className="logo-text text-4xl">SkillBridge</span>
            </Link>
            <h1 className="text-3xl font-bold text-white mt-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              Welcome Back
            </h1>
            <p className="text-slate-400 mt-3 text-sm">Sign in to continue your learning journey</p>
          </div>

          {/* Login Form */}
          <div className="glass-card rounded-2xl p-8 animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
            {error && (
              <div className="mb-6 animate-fade-in-up">
                <ErrorMessage message={error} onClose={clearError} />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="input-wrapper">
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="input-icon absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" />
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="input-field w-full pl-12 pr-4 py-3.5 rounded-xl text-sm"
                    required
                    autoComplete="email"
                  />
                </div>
                {formErrors.email && (
                  <p className="text-red-400 text-xs mt-2">{formErrors.email}</p>
                )}
              </div>

              {/* Password Input */}
              <div className="input-wrapper">
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="input-icon absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" />
                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="input-field w-full pl-12 pr-4 py-3.5 rounded-xl text-sm"
                    required
                    autoComplete="current-password"
                  />
                </div>
                {formErrors.password && (
                  <p className="text-red-400 text-xs mt-2">{formErrors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <LoadingButton
                type="submit"
                loading={isSubmitting}
                variant="primary"
                size="lg"
                fullWidth
                className="submit-btn"
              >
                Sign In
                {!isSubmitting && <ArrowRight className="h-4 w-4" />}
              </LoadingButton>
            </form>

            {/* Demo Credentials */}
            <div className="demo-card mt-6 p-4 rounded-xl">
              <p className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-2">
                <Sparkles className="h-3 w-3" />
                Demo Accounts
              </p>
              <div className="text-xs text-slate-300 space-y-1.5">
                <p><span className="text-amber-400 font-medium">Admin:</span> admin@skillbridge.com / Admin123!</p>
                <p><span className="text-amber-400 font-medium">Tutor:</span> alice.johnson@example.com / Admin123!</p>
                <p><span className="text-amber-400 font-medium">Student:</span> john.doe@example.com / Admin123!</p>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-400">
                Don't have an account?{' '}
                <Link href="/register" className="link-text font-medium">
                  Sign up now
                </Link>
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6 animate-fade-in-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
            <Link href="/" className="text-sm text-slate-400 hover:text-amber-400 transition-colors inline-flex items-center gap-1">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
