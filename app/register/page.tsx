'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/contexts/AuthContext';
import ErrorMessage from '../../src/components/ErrorMessage';
import { BookOpen, GraduationCap, User as UserIcon, Mail, Lock, UserCircle, Sparkles, ArrowRight, Shield } from 'lucide-react';

type UserRole = 'STUDENT' | 'TUTOR';

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const { register, isAuthenticated, user, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT' as UserRole
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

    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role
      });
    } catch (err) {
      console.error('Registration error:', err);
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

  const handleRoleChange = (role: UserRole) => {
    setFormData(prev => ({ ...prev, role }));
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600&display=swap');

        .register-page {
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          position: relative;
          overflow: hidden;
        }

        .register-page::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at 70% 40%, rgba(251, 191, 36, 0.08) 0%, transparent 50%),
                      radial-gradient(circle at 30% 70%, rgba(147, 51, 234, 0.06) 0%, transparent 50%),
                      radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 50%);
          animation: floatReverse 20s ease-in-out infinite;
        }

        @keyframes floatReverse {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-30px, 30px) rotate(-5deg); }
          66% { transform: translate(20px, -20px) rotate(5deg); }
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

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .animate-scale-in {
          animation: scaleIn 0.5s ease-out forwards;
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

        .role-card {
          background: rgba(255, 255, 255, 0.03);
          border: 2px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .role-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(251, 191, 36, 0.05));
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .role-card:hover {
          transform: translateY(-4px);
          border-color: rgba(251, 191, 36, 0.3);
          box-shadow: 0 10px 30px rgba(251, 191, 36, 0.2);
        }

        .role-card:hover::before {
          opacity: 1;
        }

        .role-card-active {
          border-color: #fbbf24;
          background: rgba(251, 191, 36, 0.08);
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
        }

        .role-card-active::before {
          opacity: 1;
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

        .helper-text {
          color: rgba(241, 245, 249, 0.5);
          font-size: 0.75rem;
          margin-top: 0.375rem;
        }
      `}</style>

      <div className="register-page min-h-screen flex items-center justify-center px-4 py-12">
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
              Create Your Account
            </h1>
            <p className="text-slate-400 mt-3 text-sm">Join SkillBridge and start your learning journey</p>
          </div>

          {/* Register Form */}
          <div className="glass-card rounded-2xl p-8 animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
            {error && (
              <div className="mb-6 animate-scale-in">
                <ErrorMessage message={error} onClose={clearError} />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  I want to join as <span className="text-amber-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('STUDENT')}
                    className={`role-card flex flex-col items-center gap-2 p-4 rounded-xl ${
                      formData.role === 'STUDENT' ? 'role-card-active' : ''
                    }`}
                  >
                    <UserIcon className={`h-8 w-8 transition-colors ${
                      formData.role === 'STUDENT' ? 'text-amber-400' : 'text-slate-400'
                    }`} />
                    <span className={`font-medium transition-colors ${
                      formData.role === 'STUDENT' ? 'text-amber-400' : 'text-slate-300'
                    }`}>Student</span>
                    <span className="text-xs text-slate-500">Find tutors</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('TUTOR')}
                    className={`role-card flex flex-col items-center gap-2 p-4 rounded-xl ${
                      formData.role === 'TUTOR' ? 'role-card-active' : ''
                    }`}
                  >
                    <GraduationCap className={`h-8 w-8 transition-colors ${
                      formData.role === 'TUTOR' ? 'text-amber-400' : 'text-slate-400'
                    }`} />
                    <span className={`font-medium transition-colors ${
                      formData.role === 'TUTOR' ? 'text-amber-400' : 'text-slate-300'
                    }`}>Tutor</span>
                    <span className="text-xs text-slate-500">Teach students</span>
                  </button>
                </div>
              </div>

              {/* Name Input */}
              <div className="input-wrapper">
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <UserCircle className="input-icon absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" />
                  <input
                    type="text"
                    name="name"
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    className="input-field w-full pl-12 pr-4 py-3.5 rounded-xl text-sm"
                    required
                    autoComplete="name"
                  />
                </div>
                {formErrors.name && (
                  <p className="text-red-400 text-xs mt-2">{formErrors.name}</p>
                )}
              </div>

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
                    placeholder="Minimum 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="input-field w-full pl-12 pr-4 py-3.5 rounded-xl text-sm"
                    required
                    autoComplete="new-password"
                  />
                </div>
                <p className="helper-text">Must contain uppercase, lowercase, and number</p>
                {formErrors.password && (
                  <p className="text-red-400 text-xs mt-2">{formErrors.password}</p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="input-wrapper">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Shield className="input-icon absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" />
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    className="input-field w-full pl-12 pr-4 py-3.5 rounded-xl text-sm"
                    required
                    autoComplete="new-password"
                  />
                </div>
                {formErrors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-2">{formErrors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="submit-btn w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-400">
                Already have an account?{' '}
                <Link href="/login" className="link-text font-medium">
                  Sign in
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

export default RegisterPage;
