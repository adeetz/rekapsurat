// src/utils/toast.js
import toast from 'react-hot-toast';

export const showToast = {
  success: (message) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
    });
  },
  error: (message) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
    });
  },
  loading: (message) => {
    return toast.loading(message, {
      position: 'top-right',
    });
  },
  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },
};

// Penggunaan di komponen:
/*
import { showToast } from '../utils/toast';

// Success toast
showToast.success('Data berhasil disimpan!');

// Error toast
showToast.error('Terjadi kesalahan!');

// Loading toast
const loadingToast = showToast.loading('Memproses...');
// ... setelah selesai
showToast.dismiss(loadingToast);
*/