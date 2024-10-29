// src/components/ModalForm.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function ModalForm({ isOpen, onClose, initialData = null, onSubmit }) {
  // Initial empty state
  const initialFormState = {
    nomor_surat: '',
    perihal: '',
    tanggal: '',
    jenis: 'Surat Masuk',
    created_by: 1
  };

  const [formData, setFormData] = useState(initialFormState);

  // Reset form when initialData changes or modal opens/closes
  useEffect(() => {
    if (initialData) {
      setFormData({
        nomor_surat: initialData.nomor_surat || '',
        perihal: initialData.perihal || '',
        tanggal: initialData.tanggal || '',
        jenis: initialData.jenis || 'Surat Masuk',
        created_by: initialData.created_by || 1
      });
    } else {
      setFormData(initialFormState);
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setFormData(initialFormState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      resetForm(); // Reset form setelah submit berhasil
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Terjadi kesalahan!');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl p-6 bg-white rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {initialData ? 'Edit Surat' : 'Tambah Surat Baru'}
          </h2>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-2 text-gray-500 rounded-lg hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Nomor Surat
            </label>
            <input
              type="text"
              value={formData.nomor_surat}
              onChange={(e) => setFormData({ ...formData, nomor_surat: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              placeholder="Masukkan nomor surat..."
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Perihal
            </label>
            <input
              type="text"
              value={formData.perihal}
              onChange={(e) => setFormData({ ...formData, perihal: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              placeholder="Masukkan perihal surat..."
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Tanggal
            </label>
            <input
              type="date"
              value={formData.tanggal}
              onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Jenis Surat
            </label>
            <select
              value={formData.jenis}
              onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="Surat Masuk">Surat Masuk</option>
              <option value="Surat Keluar">Surat Keluar</option>
            </select>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-6 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors duration-200"
            >
              {initialData ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}