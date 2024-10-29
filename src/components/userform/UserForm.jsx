// src/components/userform/UserForm.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function UserForm({ isOpen, onClose, initialData = null, onSubmit }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'user'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        username: initialData.username || '',
        password: '', // Password kosong saat edit
        role: initialData.role || 'user'
      });
    } else {
      setFormData({
        username: '',
        password: '',
        role: 'user'
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validasi
      if (!formData.username) {
        toast.error('Username harus diisi!');
        return;
      }

      if (!initialData && !formData.password) {
        toast.error('Password harus diisi!');
        return;
      }

      await onSubmit(formData);
      setFormData({ username: '', password: '', role: 'user' });
    } catch (error) {
      console.error('Form error:', error);
      toast.error(error.message || 'Terjadi kesalahan!');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 bg-white rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {initialData ? 'Edit User' : 'Tambah User Baru'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 rounded-lg hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Password {initialData && '(Kosongkan jika tidak ingin mengubah)'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required={!initialData}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800"
            >
              {initialData ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}