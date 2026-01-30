'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../src/components/DashboardLayout';
import { useAuth } from '../../../src/contexts/AuthContext';
import api from '../../../src/lib/api';
import { User, Mail, Lock, Save, AlertCircle, CheckCircle } from 'lucide-react';

interface ProfileFormData {
  name: string;
  email: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileFormData>({
    name: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileErrors, setProfileErrors] = useState<{ [key: string]: string }>({});
  const [passwordErrors, setPasswordErrors] = useState<{ [key: string]: string }>({});
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email
      });
    }
  }, [user]);

  const validateProfileForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!profileData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!profileData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(false);
    setProfileErrors({});

    if (!validateProfileForm()) {
      return;
    }

    setIsUpdatingProfile(true);

    try {
      await api.put('/users/profile', profileData);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 5000);
    } catch (error: any) {
      setProfileErrors({ general: error.message || 'Failed to update profile' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(false);
    setPasswordErrors({});

    if (!validatePasswordForm()) {
      return;
    }

    setIsUpdatingPassword(true);

    try {
      await api.put('/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordSuccess(true);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setPasswordSuccess(false), 5000);
    } catch (error: any) {
      setPasswordErrors({ general: error.message || 'Failed to update password' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    if (profileErrors[name]) {
      setProfileErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors(prev => {
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

        .profile-page {
          font-family: 'Inter', sans-serif;
        }

        .page-title {
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          color: #f1f5f9;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }

        .section-title {
          font-size: 20px;
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 4px;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-label {
          display: block;
          color: #cbd5e1;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(203, 213, 225, 0.4);
          transition: all 0.3s ease;
        }

        .input-field {
          width: 100%;
          padding: 14px 16px 14px 48px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #f1f5f9;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .input-field:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.08);
          border-color: #fbbf24;
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
        }

        .input-field:focus + .input-icon {
          color: #fbbf24;
        }

        .input-field::placeholder {
          color: rgba(203, 213, 225, 0.4);
        }

        .input-error {
          border-color: rgba(239, 68, 68, 0.5);
        }

        .error-text {
          color: #f87171;
          font-size: 12px;
          margin-top: 6px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .success-message {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #4ade80;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .submit-btn {
          width: 100%;
          padding: 14px 24px;
          border-radius: 12px;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: #0f172a;
          font-weight: 600;
          font-size: 14px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(251, 191, 36, 0.3);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #0f172a;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
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

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .user-badge {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-radius: 16px;
          background: rgba(251, 191, 36, 0.1);
          border: 1px solid rgba(251, 191, 36, 0.3);
        }

        .user-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 24px;
          color: #0f172a;
          border: 3px solid rgba(251, 191, 36, 0.3);
        }

        .role-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: rgba(251, 191, 36, 0.2);
          color: #fbbf24;
          border: 1px solid rgba(251, 191, 36, 0.3);
        }
      `}</style>

      <DashboardLayout allowedRoles={['STUDENT']}>
        <div className="profile-page">
          {/* Header */}
          <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
            <h1 className="page-title text-3xl md:text-4xl mb-2">Profile Settings</h1>
            <p className="text-slate-400 text-sm md:text-base">
              Manage your account information and preferences
            </p>
          </div>

          {/* User Info Card */}
          {user && (
            <div className="glass-card rounded-2xl p-6 mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
              <div className="user-badge">
                <div className="user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">{user.name}</h3>
                  <p className="text-slate-400 text-sm">{user.email}</p>
                  <span className="role-badge mt-1">{user.role}</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Information Form */}
            <div className="glass-card rounded-2xl p-6 md:p-8 animate-fade-in-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
              <h2 className="section-title">Profile Information</h2>
              <p className="text-slate-400 text-sm mb-6">Update your name and email address</p>

              <form onSubmit={handleProfileSubmit}>
                {profileErrors.general && (
                  <div className="error-message">
                    <AlertCircle size={16} />
                    {profileErrors.general}
                  </div>
                )}

                {profileSuccess && (
                  <div className="success-message">
                    <CheckCircle size={16} />
                    Profile updated successfully!
                  </div>
                )}

                {/* Name Field */}
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Full Name</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className={`input-field ${profileErrors.name ? 'input-error' : ''}`}
                      placeholder="Enter your full name"
                    />
                    <User className="input-icon" size={18} />
                  </div>
                  {profileErrors.name && (
                    <div className="error-text">
                      <AlertCircle size={14} />
                      {profileErrors.name}
                    </div>
                  )}
                </div>

                {/* Email Field */}
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <div className="input-wrapper">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className={`input-field ${profileErrors.email ? 'input-error' : ''}`}
                      placeholder="Enter your email"
                    />
                    <Mail className="input-icon" size={18} />
                  </div>
                  {profileErrors.email && (
                    <div className="error-text">
                      <AlertCircle size={14} />
                      {profileErrors.email}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="submit-btn"
                >
                  {isUpdatingProfile ? (
                    <>
                      <div className="spinner" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Change Password Form */}
            <div className="glass-card rounded-2xl p-6 md:p-8 animate-fade-in-up" style={{ animationDelay: '0.4s', opacity: 0 }}>
              <h2 className="section-title">Change Password</h2>
              <p className="text-slate-400 text-sm mb-6">Update your password to keep your account secure</p>

              <form onSubmit={handlePasswordSubmit}>
                {passwordErrors.general && (
                  <div className="error-message">
                    <AlertCircle size={16} />
                    {passwordErrors.general}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="success-message">
                    <CheckCircle size={16} />
                    Password updated successfully!
                  </div>
                )}

                {/* Current Password */}
                <div className="form-group">
                  <label htmlFor="currentPassword" className="form-label">Current Password</label>
                  <div className="input-wrapper">
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className={`input-field ${passwordErrors.currentPassword ? 'input-error' : ''}`}
                      placeholder="Enter current password"
                    />
                    <Lock className="input-icon" size={18} />
                  </div>
                  {passwordErrors.currentPassword && (
                    <div className="error-text">
                      <AlertCircle size={14} />
                      {passwordErrors.currentPassword}
                    </div>
                  )}
                </div>

                {/* New Password */}
                <div className="form-group">
                  <label htmlFor="newPassword" className="form-label">New Password</label>
                  <div className="input-wrapper">
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className={`input-field ${passwordErrors.newPassword ? 'input-error' : ''}`}
                      placeholder="Enter new password"
                    />
                    <Lock className="input-icon" size={18} />
                  </div>
                  {passwordErrors.newPassword && (
                    <div className="error-text">
                      <AlertCircle size={14} />
                      {passwordErrors.newPassword}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                  <div className="input-wrapper">
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`input-field ${passwordErrors.confirmPassword ? 'input-error' : ''}`}
                      placeholder="Confirm new password"
                    />
                    <Lock className="input-icon" size={18} />
                  </div>
                  {passwordErrors.confirmPassword && (
                    <div className="error-text">
                      <AlertCircle size={14} />
                      {passwordErrors.confirmPassword}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="submit-btn"
                >
                  {isUpdatingPassword ? (
                    <>
                      <div className="spinner" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      Update Password
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default ProfilePage;
