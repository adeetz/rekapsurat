// src/components/userform/UserForm.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

// UserForm Component
export const UserForm = ({ isOpen, onClose, initialData = null, onSubmit }) => {
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
      onClose();
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
};

// UserList Component (untuk menampilkan daftar user)
export const UserList = () => {
  const [users, setUsers] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/users.php');
      setUsers(response.data);
    } catch (error) {
      toast.error('Gagal mengambil data users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (formData) => {
    try {
      await axios.post('/api/auth.php', formData);
      toast.success('User berhasil ditambahkan!');
      fetchUsers();
      setIsFormOpen(false);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Gagal menambahkan user');
    }
  };

  const handleUpdateUser = async (formData) => {
    try {
      await axios.put(`/api/users.php?id=${selectedUser.id}`, formData);
      toast.success('User berhasil diupdate!');
      fetchUsers();
      setIsFormOpen(false);
      setSelectedUser(null);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Gagal mengupdate user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus user ini?')) {
      try {
        await axios.delete(`/api/users.php?id=${userId}`);
        toast.success('User berhasil dihapus!');
        fetchUsers();
      } catch (error) {
        toast.error('Gagal menghapus user');
      }
    }
  };

  return (
    <div className="container p-6 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manajemen User</h1>
        <button
          onClick={() => {
            setSelectedUser(null);
            setIsFormOpen(true);
          }}
          className="px-6 py-2.5 text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800"
        >
          Tambah User
        </button>
      </div>

      {isLoading ? (
        <div className="py-10 text-center">Loading...</div>
      ) : (
        <div className="overflow-hidden bg-white shadow-md rounded-xl">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Username
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                  <td className="px-6 py-4 capitalize whitespace-nowrap">{user.role}</td>
                  <td className="px-6 py-4 space-x-2 text-right whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setIsFormOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <UserForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedUser(null);
        }}
        initialData={selectedUser}
        onSubmit={selectedUser ? handleUpdateUser : handleAddUser}
      />
    </div>
  );
};

export default UserList;