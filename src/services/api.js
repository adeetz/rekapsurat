import axios from 'axios';

const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://doc.gamatekno.co.id/api'
  : '/api';


  const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    withCredentials: false
  });

  apiClient.interceptors.request.use(
    config => {
      console.log('Request:', config);
      return config;
    },
    error => {
      console.error('Request error:', error);
      return Promise.reject(error);
    }
  );
  
  // Add response interceptor for debugging
  apiClient.interceptors.response.use(
    response => {
      console.log('Response:', response);
      return response;
    },
    error => {
      console.error('Response error:', error);
      return Promise.reject(error);
    }
  );

const handleApiError = (error, operation) => {
  if (error.response) {
    console.error(`${operation} failed:`, error.response.data);
    throw {
      status: error.response.status,
      message: error.response.data.message || `Error: ${operation} failed`
    };
  } else if (error.request) {
    console.error(`${operation} failed: No response`, error.request);
    throw {
      status: 503,
      message: 'Tidak dapat terhubung ke server. Periksa koneksi Anda.'
    };
  } else {
    console.error(`${operation} failed:`, error.message);
    throw {
      status: 500,
      message: 'Terjadi kesalahan dalam aplikasi.'
    };
  }
};

// API untuk autentikasi
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth.php', credentials);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Login');
    }
  },
  logout: async () => {
    try {
      const response = await apiClient.post('/auth.php/logout');
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Logout');
    }
  }
};

// API untuk surat
export const suratAPI = {
  getAllSurat: async () => {
    try {
      const response = await apiClient.get('/surat.php');
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Mengambil data surat');
    }
  },
  
  createSurat: async (data) => {
    try {
      const response = await apiClient.post('/surat.php', data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Membuat surat');
    }
  },
  
  updateSurat: async (id, data) => {
    try {
      const response = await apiClient.put(`/surat.php?id=${id}`, data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Mengupdate surat');
    }
  },
  
  deleteSurat: async (id) => {
    try {
      const response = await apiClient.delete(`/surat.php?id=${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Menghapus surat');
    }
  }
};

// API untuk users 
export const userAPI = {
  getAllUsers: async () => {
    try {
      const response = await apiClient.get('/user.php');
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Mengambil data users');
    }
  },
  
  createUser: async (data) => {
    try {
      const response = await apiClient.post('/user.php', data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Membuat user');
    }
  },
  
  updateUser: async (id, data) => {
    try {
      const response = await apiClient.put(`/user.php?id=${id}`, data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Mengupdate user');
    }
  },
  
  deleteUser: async (id) => {
    try {
      const response = await apiClient.delete(`/user.php?id=${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Menghapus user');
    }
  }
};

export default {
  authAPI,
  suratAPI,
  userAPI
};