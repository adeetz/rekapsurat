// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, Mail, Clock, Calendar, Plus, FileText, Edit, Trash2 } from 'lucide-react';
import ModalForm from '../components/modalform/ModalForm';
import { suratAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSurat, setSelectedSurat] = useState(null);
  const [suratData, setSuratData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('semua');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fungsi untuk filter dan search
  const getFilteredData = () => {
    return suratData.filter(surat => {
      // Filter berdasarkan jenis
      const matchesFilter = 
        selectedFilter === 'semua' || 
        surat.jenis?.toLowerCase() === selectedFilter.toLowerCase();

      // Search berdasarkan nomor surat atau perihal
      const matchesSearch = 
        surat.nomor_surat?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surat.perihal?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  };

  const getJenisSuratColor = (jenis) => {
    switch (jenis?.toLowerCase()) {
      case 'surat masuk':
        return 'bg-blue-50 text-blue-700 ring-blue-600/20';
      case 'surat keluar':
        return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
      default:
        return 'bg-gray-50 text-gray-700 ring-gray-600/20';
    }
  };

  // Statistik cards dengan perhitungan dinamis
  const getStatCards = () => [
    { 
      title: 'Total Surat', 
      value: suratData.length, 
      Icon: Mail, 
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600' 
    },
    { 
      title: 'Surat Masuk', 
      value: suratData.filter(s => s.jenis === 'Surat Masuk').length, 
      Icon: Calendar, 
      bgColor: 'bg-gradient-to-br from-emerald-500 to-emerald-600' 
    },
    { 
      title: 'Surat Keluar', 
      value: suratData.filter(s => s.jenis === 'Surat Keluar').length, 
      Icon: Clock, 
      bgColor: 'bg-gradient-to-br from-amber-500 to-amber-600' 
    },
    { 
      title: 'Surat Hari Ini', 
      value: suratData.filter(s => s.tanggal === new Date().toISOString().split('T')[0]).length, 
      Icon: FileText, 
      bgColor: 'bg-gradient-to-br from-violet-500 to-violet-600' 
    }
  ];

  // Filter dropdown component
  const FilterDropdown = () => (
    <div className="relative">
      <button
        onClick={() => setIsFilterOpen(!isFilterOpen)}
        className="flex items-center px-6 py-3 text-gray-700 transition-all duration-200 bg-white border border-gray-200 shadow-sm rounded-xl hover:bg-gray-50"
      >
        <Filter className="w-4 h-4 mr-2" />
        {selectedFilter === 'semua' ? 'Filter' : selectedFilter}
      </button>
      
      {isFilterOpen && (
        <div className="absolute right-0 z-50 w-48 py-2 mt-2 bg-white border border-gray-100 shadow-lg rounded-xl">
          <button
            onClick={() => {
              setSelectedFilter('semua');
              setIsFilterOpen(false);
            }}
            className="block w-full px-4 py-2 text-left hover:bg-gray-50"
          >
            Semua
          </button>
          <button
            onClick={() => {
              setSelectedFilter('Surat Masuk');
              setIsFilterOpen(false);
            }}
            className="block w-full px-4 py-2 text-left hover:bg-gray-50"
          >
            Surat Masuk
          </button>
          <button
            onClick={() => {
              setSelectedFilter('Surat Keluar');
              setIsFilterOpen(false);
            }}
            className="block w-full px-4 py-2 text-left hover:bg-gray-50"
          >
            Surat Keluar
          </button>
        </div>
      )}
    </div>
  );

  useEffect(() => {
    fetchSuratData();
  }, []);

  const fetchSuratData = async () => {
    try {
      setIsLoading(true);
      const response = await suratAPI.getAllSurat();
      console.log('API Response:', response); // Debug log
      if (response?.status === 'success' && response?.data) {
        setSuratData(response.data);
      } else {
        setSuratData([]);
        console.warn('Invalid data format:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data surat!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedSurat(null);
    setIsModalOpen(true);
  };

  const handleEdit = (surat) => {
    setSelectedSurat(surat);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSurat(null);
  };

  const handleSubmitSurat = async (formData) => {
    try {
      if (selectedSurat) {
        await suratAPI.updateSurat(selectedSurat.id, formData);
        toast.success('Surat berhasil diupdate!');
      } else {
        await suratAPI.createSurat(formData);
        toast.success('Surat berhasil ditambahkan!');
      }
      fetchSuratData();
      handleCloseModal();
    } catch (error) {
      console.error('Error submitting data:', error);
      toast.error('Gagal menyimpan data surat!');
    }
  };

  const handleDelete = async (suratId, nomorSurat) => {
    try {
      const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: `Surat dengan nomor "${nomorSurat}" akan dihapus secara permanen!`,
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
        await suratAPI.deleteSurat(suratId);
        
        await Swal.fire({
          title: 'Terhapus!',
          text: 'Surat berhasil dihapus.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        
        fetchSuratData();
      }
    } catch (error) {
      console.error('Error deleting surat:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Gagal menghapus surat.',
        icon: 'error',
        confirmButtonColor: '#3085d6',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-transparent bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text">
            Manajemen Surat
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Kelola semua surat masuk dan keluar dengan efisien
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          {getStatCards().map((card, index) => (
            <div key={index} className="overflow-hidden transition-all duration-300 bg-white shadow-md rounded-xl hover:shadow-xl group">
              <div className={`p-6 ${card.bgColor}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/80">{card.title}</p>
                    <p className="mt-1 text-3xl font-bold text-white">{card.value}</p>
                  </div>
                  <div className="p-3 transition-transform duration-300 bg-white/20 rounded-xl group-hover:scale-110">
                    <card.Icon className="text-white w-7 h-7" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table Section */}
        <div className="bg-white shadow-md rounded-xl">
          {/* Search and Filter Section */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col items-start justify-between space-y-4 lg:flex-row lg:items-center lg:space-y-0">
              <div className="relative w-full lg:w-96">
                <input
                  type="text"
                  placeholder="Cari nomor surat atau perihal..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-3 pr-4 transition-all duration-200 border border-gray-200 pl-11 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute w-5 h-5 text-gray-400 left-4 top-3.5" />
              </div>
              <div className="flex justify-end w-full space-x-4 lg:w-auto">
                <FilterDropdown />
                <button
                  onClick={handleAdd}
                  className="flex items-center px-6 py-3 text-white transition-all duration-200 shadow-md bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 hover:shadow-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Surat Baru
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-4 py-4 text-sm font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-50">
                    Nomor Surat
                  </th>
                  <th className="px-4 py-4 text-sm font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-50">
                    Perihal
                  </th>
                  <th className="px-4 py-4 text-sm font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-50">
                    Tanggal
                  </th>
                  <th className="px-4 py-4 text-sm font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-50">
                    Jenis Surat
                  </th>
                  <th className="px-4 py-4 text-sm font-semibold tracking-wider text-center text-gray-600 uppercase bg-gray-50">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                      Memuat data...
                    </td>
                  </tr>
                ) : getFilteredData().length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                      {searchQuery || selectedFilter !== 'semua' 
                        ? 'Tidak ada surat yang sesuai dengan pencarian'
                        : 'Tidak ada data surat'}
                    </td>
                  </tr>
                ) : (
                  getFilteredData().map((surat) => (
                    <tr key={surat.id} className="group">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        {surat.nomor_surat}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {surat.perihal}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {new Date(surat.tanggal).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium ring-1 ring-inset ${getJenisSuratColor(surat.jenis)}`}>
                          {surat.jenis}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(surat)}
                            className="p-2 transition-colors duration-200 rounded-lg text-amber-600 hover:bg-amber-50"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(surat.id, surat.nomor_surat)}
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
      </div>

      {/* Modal */}
      <ModalForm 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        initialData={selectedSurat}
        onSubmit={handleSubmitSurat}
      />
    </div>
  );
}