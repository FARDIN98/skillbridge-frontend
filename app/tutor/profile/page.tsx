'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../src/components/DashboardLayout';
import api from '../../../src/lib/api';
import { Save, AlertCircle, CheckCircle, Award, Plus, X } from 'lucide-react';

interface TutorProfileData {
  bio: string;
  hourlyRate: number;
  subjects: string[];
  experience: number;
}

const TutorProfilePage: React.FC = () => {
  const [profileData, setProfileData] = useState<TutorProfileData>({
    bio: '',
    hourlyRate: 0,
    subjects: [],
    experience: 0
  });
  const [newSubject, setNewSubject] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/tutors/profile');
        const profile = response.data.tutorProfile || response.data;

        if (profile) {
          setProfileData({
            bio: profile.bio || '',
            hourlyRate: profile.hourlyRate || 0,
            subjects: profile.subjects || [],
            experience: profile.experience || 0
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!profileData.bio.trim()) {
      newErrors.bio = 'Bio is required';
    } else if (profileData.bio.length < 50) {
      newErrors.bio = 'Bio must be at least 50 characters';
    }

    if (profileData.hourlyRate <= 0) {
      newErrors.hourlyRate = 'Hourly rate must be greater than 0';
    } else if (profileData.hourlyRate > 500) {
      newErrors.hourlyRate = 'Hourly rate seems too high';
    }

    if (profileData.subjects.length === 0) {
      newErrors.subjects = 'Please add at least one subject';
    }

    if (profileData.experience < 0) {
      newErrors.experience = 'Experience cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await api.put('/tutors/profile', profileData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (error: any) {
      setErrors({ general: error.message || 'Failed to update profile' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: name === 'hourlyRate' || name === 'experience' ? Number(value) : value
    }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddSubject = () => {
    const trimmedSubject = newSubject.trim();
    if (trimmedSubject && !profileData.subjects.includes(trimmedSubject)) {
      setProfileData(prev => ({
        ...prev,
        subjects: [...prev.subjects, trimmedSubject]
      }));
      setNewSubject('');
      if (errors.subjects) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.subjects;
          return newErrors;
        });
      }
    }
  };

  const handleRemoveSubject = (subject: string) => {
    setProfileData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s !== subject)
    }));
  };

  const handleSubjectKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubject();
    }
  };

  if (loading) {
    return (
      <>
        <style jsx global>{`
          .loading-screen {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 400px;
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
        <DashboardLayout allowedRoles={['TUTOR']}>
          <div className="loading-screen">
            <div className="loading-spinner" />
          </div>
        </DashboardLayout>
      </>
    );
  }

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

        .form-input, .form-textarea {
          width: 100%;
          padding: 14px 16px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #f1f5f9;
          font-size: 14px;
          transition: all 0.3s ease;
          font-family: 'Inter', sans-serif;
        }

        .form-textarea {
          resize: vertical;
          min-height: 120px;
        }

        .form-input:focus, .form-textarea:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.08);
          border-color: #fbbf24;
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
        }

        .form-input::placeholder, .form-textarea::placeholder {
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

        .char-count {
          text-align: right;
          font-size: 12px;
          color: #64748b;
          margin-top: 4px;
        }

        .input-prefix {
          position: relative;
        }

        .input-prefix-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(203, 213, 225, 0.4);
        }

        .input-prefix input {
          padding-left: 44px;
        }

        .subjects-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }

        .subject-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 8px;
          background: rgba(251, 191, 36, 0.1);
          border: 1px solid rgba(251, 191, 36, 0.3);
          color: #fbbf24;
          font-size: 13px;
          font-weight: 500;
        }

        .subject-remove {
          background: none;
          border: none;
          color: #fbbf24;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          transition: all 0.2s ease;
        }

        .subject-remove:hover {
          color: #f87171;
        }

        .add-subject-container {
          display: flex;
          gap: 8px;
        }

        .add-subject-btn {
          padding: 14px 20px;
          border-radius: 12px;
          background: rgba(251, 191, 36, 0.1);
          border: 1px solid rgba(251, 191, 36, 0.3);
          color: #fbbf24;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }

        .add-subject-btn:hover {
          background: rgba(251, 191, 36, 0.2);
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
      `}</style>

      <DashboardLayout allowedRoles={['TUTOR']}>
        <div className="profile-page">
          {/* Header */}
          <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
            <h1 className="page-title text-3xl md:text-4xl mb-2">Tutor Profile</h1>
            <p className="text-slate-400 text-sm md:text-base">
              Update your professional information to attract more students
            </p>
          </div>

          {/* Profile Form */}
          <div className="glass-card rounded-2xl p-6 md:p-8 animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
            <form onSubmit={handleSubmit}>
              {errors.general && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  {errors.general}
                </div>
              )}

              {success && (
                <div className="success-message">
                  <CheckCircle size={16} />
                  Profile updated successfully!
                </div>
              )}

              {/* Bio */}
              <div className="form-group">
                <label htmlFor="bio" className="form-label">
                  Professional Bio *
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={profileData.bio}
                  onChange={handleChange}
                  className={`form-textarea ${errors.bio ? 'input-error' : ''}`}
                  placeholder="Tell students about your teaching experience, approach, and what makes you a great tutor..."
                  maxLength={1000}
                />
                <div className="char-count">
                  {profileData.bio.length}/1000 characters (minimum 50)
                </div>
                {errors.bio && (
                  <div className="error-text">
                    <AlertCircle size={14} />
                    {errors.bio}
                  </div>
                )}
              </div>

              {/* Hourly Rate */}
              <div className="form-group">
                <label htmlFor="hourlyRate" className="form-label">
                  Hourly Rate (BDT) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">৳</span>
                  <input
                    type="number"
                    id="hourlyRate"
                    name="hourlyRate"
                    value={profileData.hourlyRate || ''}
                    onChange={handleChange}
                    className={`form-input pl-8 ${errors.hourlyRate ? 'input-error' : ''}`}
                    placeholder="50"
                    min="1"
                    max="500"
                    step="1"
                  />
                </div>
                {errors.hourlyRate && (
                  <div className="error-text">
                    <AlertCircle size={14} />
                    {errors.hourlyRate}
                  </div>
                )}
              </div>

              {/* Subjects */}
              <div className="form-group">
                <label className="form-label">
                  Subjects You Teach *
                </label>
                {profileData.subjects.length > 0 && (
                  <div className="subjects-container">
                    {profileData.subjects.map((subject, index) => (
                      <span key={index} className="subject-tag">
                        {subject}
                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(subject)}
                          className="subject-remove"
                        >
                          <X size={16} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="add-subject-container">
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    onKeyPress={handleSubjectKeyPress}
                    className={`form-input ${errors.subjects ? 'input-error' : ''}`}
                    placeholder="e.g., Mathematics, Physics, Programming"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubject}
                    className="add-subject-btn"
                  >
                    <Plus size={16} />
                    Add
                  </button>
                </div>
                {errors.subjects && (
                  <div className="error-text">
                    <AlertCircle size={14} />
                    {errors.subjects}
                  </div>
                )}
              </div>

              {/* Experience */}
              <div className="form-group">
                <label htmlFor="experience" className="form-label">
                  Years of Experience *
                </label>
                <div className="input-prefix">
                  <Award className="input-prefix-icon" size={18} />
                  <input
                    type="number"
                    id="experience"
                    name="experience"
                    value={profileData.experience || ''}
                    onChange={handleChange}
                    className={`form-input ${errors.experience ? 'input-error' : ''}`}
                    placeholder="5"
                    min="0"
                    max="50"
                    step="1"
                  />
                </div>
                {errors.experience && (
                  <div className="error-text">
                    <AlertCircle size={14} />
                    {errors.experience}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="submit-btn"
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Profile
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default TutorProfilePage;
