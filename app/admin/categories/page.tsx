'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../src/components/DashboardLayout';
import ConfirmModal from '../../../src/components/ConfirmModal';
import api from '../../../src/lib/api';
import { useToast } from '../../../src/contexts/ToastContext';
import { getErrorMessage, logError } from '../../../src/lib/errors';
import { validateForm, ValidationErrors } from '../../../src/lib/validation';
import { Search, Plus, Edit, Trash2, X, Sparkles } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  createdAt: string;
}

const AdminCategoriesPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories');
      const categoryData = response.data.categories || response.data || [];
      setCategories(categoryData);
      setFilteredCategories(categoryData);
    } catch (error: any) {
      logError(error, 'Fetch Categories');
      const errorMessage = getErrorMessage(error);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter categories based on search
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = categories.filter(
        cat =>
          cat.name.toLowerCase().includes(query) ||
          cat.description.toLowerCase().includes(query)
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [searchQuery, categories]);

  const handleAddCategory = async () => {
    // Validate form
    const errors = validateForm(formData, {
      name: { required: true, minLength: 2, message: 'Name must be at least 2 characters' },
      description: { required: true, minLength: 10, message: 'Description must be at least 10 characters' }
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showError(Object.values(errors)[0]);
      return;
    }

    try {
      setSubmitting(true);
      setFormErrors({});
      await api.post('/categories', formData);
      showSuccess('Category added successfully!');
      setFormData({ name: '', description: '' });
      setIsAddModalOpen(false);
      fetchCategories();
    } catch (error: any) {
      logError(error, 'Add Category');
      const errorMessage = getErrorMessage(error);
      showError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCategory = async () => {
    if (!selectedCategory) return;

    // Validate form
    const errors = validateForm(formData, {
      name: { required: true, minLength: 2, message: 'Name must be at least 2 characters' },
      description: { required: true, minLength: 10, message: 'Description must be at least 10 characters' }
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showError(Object.values(errors)[0]);
      return;
    }

    try {
      setSubmitting(true);
      setFormErrors({});
      await api.put(`/categories/${selectedCategory.id}`, formData);
      showSuccess('Category updated successfully!');
      setIsEditModalOpen(false);
      setSelectedCategory(null);
      setFormData({ name: '', description: '' });
      fetchCategories();
    } catch (error: any) {
      logError(error, 'Edit Category');
      const errorMessage = getErrorMessage(error);
      showError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    try {
      setSubmitting(true);
      await api.delete(`/categories/${selectedCategory.id}`);
      showSuccess('Category deleted successfully!');
      setDeleteConfirmOpen(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (error: any) {
      logError(error, 'Delete Category');
      const errorMessage = getErrorMessage(error);
      showError(errorMessage);
      setDeleteConfirmOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setFormData({ name: category.name, description: category.description });
    setIsEditModalOpen(true);
    setError('');
  };

  const openDeleteModal = (category: Category) => {
    setSelectedCategory(category);
    setDeleteConfirmOpen(true);
  };

  const closeModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedCategory(null);
    setFormData({ name: '', description: '' });
    setFormErrors({});
  };

  return (
    <DashboardLayout allowedRoles={['ADMIN']}>
      <div className="min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-slate-100 text-3xl md:text-4xl font-bold mb-2">
            Categories
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            Manage subject categories for tutors and students
          </p>
        </div>

        {/* Search and Add Button */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 transition-all duration-300 focus-within:bg-white/8 focus-within:border-amber-400">
            <Search className="h-5 w-5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-slate-100 text-sm placeholder:text-slate-500"
            />
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-400/30"
          >
            <Plus className="h-5 w-5" />
            <span>Add Category</span>
          </button>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-40 bg-white/5 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-16 px-6">
            <Sparkles className="h-12 w-12 mx-auto mb-3 text-slate-600" />
            <p className="text-lg font-semibold text-slate-400 mb-1">No categories found</p>
            <p className="text-sm text-slate-500">
              {searchQuery ? 'Try adjusting your search' : 'Create your first category to get started'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:bg-white/[0.05] hover:border-amber-400/30 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Category Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-500/20 border border-amber-400/30 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-amber-400" />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(category)}
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-slate-400 flex items-center justify-center transition-all duration-300 hover:bg-blue-500/20 hover:border-blue-500/30 hover:text-blue-400"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(category)}
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-slate-400 flex items-center justify-center transition-all duration-300 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Category Info */}
                <h3 className="text-slate-100 font-semibold text-lg mb-2 line-clamp-1">
                  {category.name}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-3">
                  {category.description}
                </p>
                <div className="pt-3 border-t border-white/5">
                  <span className="inline-block px-3 py-1 text-xs rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 font-medium">
                    {category.slug}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Count */}
        {!loading && filteredCategories.length > 0 && (
          <div className="mt-6 text-slate-400 text-sm">
            Showing {filteredCategories.length} of {categories.length} categories
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
          onClick={closeModals}
        >
          <div
            className="bg-slate-900/98 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-lg w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center">
                  <Plus className="h-6 w-6 text-amber-400" />
                </div>
                <h2 className="font-bold text-slate-100 text-2xl">Add Category</h2>
              </div>
              <button
                onClick={closeModals}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-slate-400 flex items-center justify-center transition-all duration-300 hover:bg-white/10 hover:border-amber-400/30 hover:text-amber-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formErrors.name) {
                      setFormErrors({ ...formErrors, name: '' });
                    }
                  }}
                  placeholder="e.g., Mathematics"
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-slate-100 text-sm placeholder:text-slate-500 outline-none transition-all duration-300 focus:bg-white/8 ${
                    formErrors.name ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-amber-400'
                  }`}
                />
                {formErrors.name && (
                  <p className="mt-1 text-xs text-red-400">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    if (formErrors.description) {
                      setFormErrors({ ...formErrors, description: '' });
                    }
                  }}
                  placeholder="Describe this category..."
                  rows={4}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-slate-100 text-sm placeholder:text-slate-500 outline-none transition-all duration-300 focus:bg-white/8 resize-none ${
                    formErrors.description ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-amber-400'
                  }`}
                />
                {formErrors.description && (
                  <p className="mt-1 text-xs text-red-400">{formErrors.description}</p>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModals}
                className="flex-1 px-6 py-3 rounded-xl font-semibold text-sm bg-white/5 border border-white/10 text-slate-300 transition-all duration-300 hover:bg-white/8 hover:border-white/20"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                disabled={submitting}
                className="flex-1 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-400/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {submitting ? 'Adding...' : 'Add Category'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {isEditModalOpen && selectedCategory && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
          onClick={closeModals}
        >
          <div
            className="bg-slate-900/98 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-lg w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <Edit className="h-6 w-6 text-blue-400" />
                </div>
                <h2 className="font-bold text-slate-100 text-2xl">Edit Category</h2>
              </div>
              <button
                onClick={closeModals}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-slate-400 flex items-center justify-center transition-all duration-300 hover:bg-white/10 hover:border-amber-400/30 hover:text-amber-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formErrors.name) {
                      setFormErrors({ ...formErrors, name: '' });
                    }
                  }}
                  placeholder="e.g., Mathematics"
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-slate-100 text-sm placeholder:text-slate-500 outline-none transition-all duration-300 focus:bg-white/8 ${
                    formErrors.name ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-amber-400'
                  }`}
                />
                {formErrors.name && (
                  <p className="mt-1 text-xs text-red-400">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    if (formErrors.description) {
                      setFormErrors({ ...formErrors, description: '' });
                    }
                  }}
                  placeholder="Describe this category..."
                  rows={4}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-slate-100 text-sm placeholder:text-slate-500 outline-none transition-all duration-300 focus:bg-white/8 resize-none ${
                    formErrors.description ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-amber-400'
                  }`}
                />
                {formErrors.description && (
                  <p className="mt-1 text-xs text-red-400">{formErrors.description}</p>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModals}
                className="flex-1 px-6 py-3 rounded-xl font-semibold text-sm bg-white/5 border border-white/10 text-slate-300 transition-all duration-300 hover:bg-white/8 hover:border-white/20"
              >
                Cancel
              </button>
              <button
                onClick={handleEditCategory}
                disabled={submitting}
                className="flex-1 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {submitting ? 'Updating...' : 'Update Category'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Delete Category"
        message={`Are you sure you want to delete "${selectedCategory?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={handleDeleteCategory}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setSelectedCategory(null);
        }}
      />
    </DashboardLayout>
  );
};

export default AdminCategoriesPage;
