'use client';

import React, { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import DashboardLayout from '../../../src/components/DashboardLayout';
import ConfirmModal from '../../../src/components/ConfirmModal';
import { DataTable } from '../../../src/components/DataTable';
import { createBadgeColumn, createDateColumn, createActionsColumn, statusColorMaps } from '../../../src/components/DataTable/columns';
import api from '../../../src/lib/api';
import { useToast } from '../../../src/contexts/ToastContext';
import { getErrorMessage, logError } from '../../../src/lib/errors';
import { Search, Filter, UserCheck, UserX } from 'lucide-react';

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

  // Define table columns
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center font-bold text-slate-900 border-2 border-red-400/30 shrink-0">
            {row.original.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-white font-medium text-sm">{row.original.name}</p>
            <p className="text-slate-400 text-xs md:hidden">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ getValue }) => (
        <p className="text-slate-400 text-sm truncate max-w-xs" title={getValue() as string}>
          {getValue() as string}
        </p>
      ),
    },
    createBadgeColumn<User>('role', 'Role', statusColorMaps.role),
    createBadgeColumn<User>('status', 'Status', statusColorMaps.user),
    createDateColumn<User>('createdAt', 'Joined', 'date'),
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        if (row.original.role === 'ADMIN') {
          return <span className="text-slate-500 text-xs">No actions</span>;
        }
        return (
          <button
            onClick={() => handleToggleStatus(row.original)}
            disabled={actionLoading}
            className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all min-h-11 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              row.original.status === 'ACTIVE'
                ? 'text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 focus:ring-red-400'
                : 'text-green-400 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 focus:ring-green-400'
            }`}
          >
            {row.original.status === 'ACTIVE' ? (
              <>
                <UserX className="h-4 w-4" />
                <span className="hidden sm:inline">Ban</span>
              </>
            ) : (
              <>
                <UserCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Unban</span>
              </>
            )}
          </button>
        );
      },
    },
  ];

  // Mobile card renderer
  const mobileCard = (user: User) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center font-bold text-slate-900 border-2 border-red-400/30 shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-base truncate">{user.name}</p>
            <p className="text-slate-400 text-sm truncate">{user.email}</p>
          </div>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${
          user.status === 'ACTIVE'
            ? 'bg-green-500/10 text-green-400 border-green-500/30 border'
            : 'bg-red-500/10 text-red-400 border-red-500/30 border'
        }`}>
          {user.status}
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Role:</span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user.role === 'STUDENT' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 border' :
            user.role === 'TUTOR' ? 'bg-green-500/10 text-green-400 border-green-500/30 border' :
            'bg-purple-500/10 text-purple-400 border-purple-500/30 border'
          }`}>
            {user.role}
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span>•</span>
          <span>{new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      {user.role !== 'ADMIN' && (
        <button
          onClick={() => handleToggleStatus(user)}
          disabled={actionLoading}
          className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all min-h-11 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            user.status === 'ACTIVE'
              ? 'text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 focus:ring-red-400'
              : 'text-green-400 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 focus:ring-green-400'
          }`}
        >
          {user.status === 'ACTIVE' ? (
            <>
              <UserX className="h-4 w-4" />
              Ban User
            </>
          ) : (
            <>
              <UserCheck className="h-4 w-4" />
              Unban User
            </>
          )}
        </button>
      )}
    </div>
  );

  return (
    <DashboardLayout allowedRoles={['ADMIN']}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">User Management</h1>
          <p className="text-slate-400 text-sm md:text-base">
            View and manage all platform users
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:bg-white/10 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-400/20 transition-all">
            <Search className="h-5 w-5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder:text-slate-500"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-slate-400 shrink-0" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm cursor-pointer transition-all focus:outline-none focus:bg-white/10 focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
            >
              <option value="ALL">All Roles</option>
              <option value="STUDENT">Students</option>
              <option value="TUTOR">Tutors</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <DataTable
          columns={columns}
          data={filteredUsers}
          loading={loading}
          mobileCard={mobileCard}
          emptyMessage={searchQuery || roleFilter !== 'ALL' ? 'No users found matching your criteria' : 'No users available'}
        />

        {/* Stats */}
        {!loading && (
          <div className="text-slate-400 text-sm">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        )}
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
  );
};

export default AdminUsersPage;
