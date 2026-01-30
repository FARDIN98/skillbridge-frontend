'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../src/components/DashboardLayout';
import ConfirmModal from '../../../src/components/ConfirmModal';
import api from '../../../src/lib/api';
import { useToast } from '../../../src/contexts/ToastContext';
import { getErrorMessage, logError } from '../../../src/lib/errors';
import { TableRowSkeleton } from '../../../src/components/Skeleton';
import { Search, Filter, UserCheck, UserX } from 'lucide-react';
import { format } from 'date-fns';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'TUTOR' | 'ADMIN';
  status: 'ACTIVE' | 'BANNED';
  createdAt: string;
}

type RoleFilter = 'ALL' | 'STUDENT' | 'TUTOR' | 'ADMIN';

const AdminUsersPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users', {
        params: {
          search: searchQuery || undefined,
          role: roleFilter !== 'ALL' ? roleFilter : undefined
        }
      });
      const userData = response.data.users || response.data || [];
      setUsers(userData);
      setFilteredUsers(userData);
    } catch (error: any) {
      logError(error, 'Fetch Users');
      const errorMessage = getErrorMessage(error);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search and role
  useEffect(() => {
    let filtered = [...users];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        user =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    }

    // Apply role filter
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [searchQuery, roleFilter, users]);

  const handleToggleStatus = (user: User) => {
    setSelectedUser(user);
    setShowConfirmModal(true);
  };

  const confirmToggleStatus = async () => {
    if (!selectedUser) return;

    setActionLoading(true);

    try {
      const newStatus = selectedUser.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
      await api.patch(`/admin/users/${selectedUser.id}/status`, { status: newStatus });

      showSuccess(
        `User ${selectedUser.status === 'ACTIVE' ? 'banned' : 'unbanned'} successfully!`
      );

      // Update local state
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === selectedUser.id ? { ...u, status: newStatus } : u
        )
      );

      setShowConfirmModal(false);
      setSelectedUser(null);
    } catch (error: any) {
      logError(error, 'Update User Status');
      const errorMessage = getErrorMessage(error);
      showError(errorMessage);
      setShowConfirmModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'TUTOR':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'STUDENT':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'ACTIVE'
      ? 'bg-green-500/20 text-green-400 border-green-500/30'
      : 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600&display=swap');

        .users-page {
          font-family: 'Inter', sans-serif;
        }

        .page-title {
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          color: #f1f5f9;
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 12px 16px;
          transition: all 0.3s ease;
        }

        .search-bar:focus-within {
          background: rgba(255, 255, 255, 0.08);
          border-color: #fbbf24;
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
        }

        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #f1f5f9;
          font-size: 14px;
        }

        .search-input::placeholder {
          color: #64748b;
        }

        .filter-select {
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #f1f5f9;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-select:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.08);
          border-color: #fbbf24;
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
        }

        .users-table {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          overflow: hidden;
        }

        .table-header {
          display: grid;
          grid-template-columns: auto 1fr 1.5fr auto auto auto auto;
          gap: 16px;
          padding: 16px 24px;
          background: rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #cbd5e1;
        }

        .table-row {
          display: grid;
          grid-template-columns: auto 1fr 1.5fr auto auto auto auto;
          gap: 16px;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
          align-items: center;
        }

        .table-row:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .table-row:last-child {
          border-bottom: none;
        }

        @media (max-width: 1024px) {
          .table-header,
          .table-row {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .table-header {
            display: none;
          }

          .table-row {
            padding: 16px;
          }
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
          color: #0f172a;
          border: 2px solid rgba(251, 191, 36, 0.3);
          flex-shrink: 0;
        }

        .badge {
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
          border: 1px solid;
          display: inline-block;
        }

        .action-btn {
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }

        .btn-ban {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
          color: #f87171;
        }

        .btn-ban:hover {
          background: rgba(239, 68, 68, 0.2);
          transform: translateY(-2px);
        }

        .btn-unban {
          background: rgba(34, 197, 94, 0.1);
          border-color: rgba(34, 197, 94, 0.3);
          color: #4ade80;
        }

        .btn-unban:hover {
          background: rgba(34, 197, 94, 0.2);
          transform: translateY(-2px);
        }

        .alert-message {
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid;
        }

        .alert-error {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
          color: #f87171;
        }

        .alert-success {
          background: rgba(34, 197, 94, 0.1);
          border-color: rgba(34, 197, 94, 0.3);
          color: #4ade80;
        }

        .loading-shimmer {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.03) 0%,
            rgba(255, 255, 255, 0.08) 50%,
            rgba(255, 255, 255, 0.03) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 12px;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
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

        .empty-state {
          text-align: center;
          padding: 64px 24px;
          color: #64748b;
        }

        .mobile-label {
          display: none;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #64748b;
          margin-bottom: 4px;
        }

        @media (max-width: 1024px) {
          .mobile-label {
            display: block;
          }
        }
      `}</style>

      <DashboardLayout allowedRoles={['ADMIN']}>
        <div className="users-page">
          {/* Header */}
          <div
            className="mb-6 animate-fade-in-up"
            style={{ animationDelay: '0.1s', opacity: 0 }}
          >
            <h1 className="page-title text-3xl md:text-4xl mb-2">User Management</h1>
            <p className="text-slate-400 text-sm md:text-base">
              View and manage all platform users
            </p>
          </div>


          {/* Filters */}
          <div
            className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up"
            style={{ animationDelay: '0.2s', opacity: 0 }}
          >
            <div className="search-bar">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-slate-400 flex-shrink-0" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
                className="filter-select flex-1"
              >
                <option value="ALL">All Roles</option>
                <option value="STUDENT">Students</option>
                <option value="TUTOR">Tutors</option>
                <option value="ADMIN">Admins</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="users-table">
              <div className="table-header">
                <div></div>
                <div>Name</div>
                <div>Email</div>
                <div>Role</div>
                <div>Status</div>
                <div>Joined</div>
                <div>Actions</div>
              </div>
              <table className="w-full">
                <tbody>
                  {[...Array(5)].map((_, i) => (
                    <TableRowSkeleton key={i} columns={7} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div
              className="empty-state animate-fade-in-up"
              style={{ animationDelay: '0.3s', opacity: 0 }}
            >
              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-semibold mb-1">No users found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div
              className="users-table animate-fade-in-up"
              style={{ animationDelay: '0.3s', opacity: 0 }}
            >
              <div className="table-header">
                <div></div>
                <div>Name</div>
                <div>Email</div>
                <div>Role</div>
                <div>Status</div>
                <div>Joined</div>
                <div>Actions</div>
              </div>

              {filteredUsers.map((user, index) => (
                <div
                  key={user.id}
                  className="table-row animate-fade-in-up"
                  style={{ animationDelay: `${0.4 + index * 0.05}s`, opacity: 0 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="user-avatar">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <div>
                    <span className="mobile-label">Name</span>
                    <p className="text-white font-medium text-sm">{user.name}</p>
                  </div>

                  <div>
                    <span className="mobile-label">Email</span>
                    <p className="text-slate-400 text-sm">{user.email}</p>
                  </div>

                  <div>
                    <span className="mobile-label">Role</span>
                    <span className={`badge ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>

                  <div>
                    <span className="mobile-label">Status</span>
                    <span className={`badge ${getStatusBadgeColor(user.status)}`}>
                      {user.status}
                    </span>
                  </div>

                  <div>
                    <span className="mobile-label">Joined</span>
                    <p className="text-slate-400 text-sm">
                      {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                    </p>
                  </div>

                  <div>
                    <span className="mobile-label">Actions</span>
                    {user.role !== 'ADMIN' && (
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`action-btn ${
                          user.status === 'ACTIVE' ? 'btn-ban' : 'btn-unban'
                        }`}
                        disabled={actionLoading}
                      >
                        {user.status === 'ACTIVE' ? (
                          <>
                            <UserX size={14} />
                            Ban
                          </>
                        ) : (
                          <>
                            <UserCheck size={14} />
                            Unban
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          <div
            className="mt-6 text-slate-400 text-sm animate-fade-in-up"
            style={{ animationDelay: '0.5s', opacity: 0 }}
          >
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>

        {/* Confirm Modal */}
        <ConfirmModal
          isOpen={showConfirmModal}
          title={
            selectedUser?.status === 'ACTIVE' ? 'Ban User?' : 'Unban User?'
          }
          message={
            selectedUser?.status === 'ACTIVE'
              ? `Are you sure you want to ban ${selectedUser?.name}? They will lose access to the platform.`
              : `Are you sure you want to unban ${selectedUser?.name}? They will regain access to the platform.`
          }
          confirmText={selectedUser?.status === 'ACTIVE' ? 'Ban User' : 'Unban User'}
          cancelText="Cancel"
          isDangerous={selectedUser?.status === 'ACTIVE'}
          onConfirm={confirmToggleStatus}
          onCancel={() => {
            setShowConfirmModal(false);
            setSelectedUser(null);
          }}
        />
      </DashboardLayout>
    </>
  );
};

export default AdminUsersPage;
