// src/pages/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { userAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import UserForm from '../components/userform/UserForm';
import Swal from 'sweetalert2';

export default function UserManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userData, setUserData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const response = await userAPI.getAllUsers();
      setUserData(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Gagal memuat data user!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (userId, username) => {
    try {
      const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: `User "${username}" akan dihapus secara permanen!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal',
        reverseButtons: true
      });

      if (result.isConfirmed) {
        setIsLoading(true);
        await userAPI.deleteUser(userId);
        
        await Swal.fire({
          title: 'Terhapus!',
          text: 'User berhasil dihapus.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        
        fetchUserData();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Gagal menghapus user.',
        icon: 'error',
        confirmButtonColor: '#3085d6',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedUser) {
        await userAPI.updateUser(selectedUser.id, formData);
        toast.success('User berhasil diupdate!');
      } else {
        await userAPI.createUser(formData);
        toast.success('User berhasil ditambahkan!');
      }
      fetchUserData();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error submitting user:', error);
      toast.error('Gagal menyimpan data user!');
    }
  };

  const filteredUsers = userData.filter(user => 
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-transparent bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text">
          Manajemen User
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Kelola semua pengguna sistem
        </p>
      </div>

      {/* Table Section */}
      <div className="bg-white shadow-md rounded-xl">
        {/* Search and Add Section */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col items-start justify-between space-y-4 lg:flex-row lg:items-center lg:space-y-0">
            <div className="relative w-full lg:w-96">
              <input
                type="text"
                placeholder="Cari username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-3 pr-4 transition-all duration-200 border border-gray-200 pl-11 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute w-5 h-5 text-gray-400 left-4 top-3.5" />
            </div>
            <button
              onClick={handleAdd}
              className="flex items-center px-6 py-3 text-white transition-all duration-200 shadow-md bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 hover:shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah User
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="p-6">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-4 py-4 text-sm font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-50">
                  Username
                </th>
                <th className="px-4 py-4 text-sm font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-50">
                  Role
                </th>
                <th className="px-4 py-4 text-sm font-semibold tracking-wider text-center text-gray-600 uppercase bg-gray-50">
                  Tanggal Dibuat
                </th>
                <th className="px-4 py-4 text-sm font-semibold tracking-wider text-center text-gray-600 uppercase bg-gray-50">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                    {searchQuery ? 'Tidak ada user yang sesuai dengan pencarian' : 'Tidak ada data user'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="group">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      {user.username}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {user.role || 'User'}
                    </td>
                    <td className="px-4 py-4 text-sm text-center text-gray-600">
                      {new Date(user.created_at).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 transition-colors duration-200 rounded-lg text-amber-600 hover:bg-amber-50"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.username)}
                          className="p-2 text-red-600 transition-colors duration-200 rounded-lg hover:bg-red-50"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      <UserForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedUser}
      />
    </div>
  );
}