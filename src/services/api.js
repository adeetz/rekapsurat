import axios from 'axios';

// Base URL configuration
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://doc.gamatekno.co.id/api'
  : '/api';

// Create axios instance with better configuration
const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    },
    withCredentials: true,
    timeout: 30000,
});

// Request interceptor
apiClient.interceptors.request.use(
    config => {
        config.params = {
            ...config.params,
            _t: Date.now()
        };
        
        if (process.env.NODE_ENV !== 'production') {
            console.log('Request:', {
                url: config.url,
                method: config.method,
                data: config.data,
                headers: config.headers
            });
        }
        return config;
    },
    error => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    response => {
        if (process.env.NODE_ENV !== 'production') {
            console.log('Response:', {
                url: response.config.url,
                status: response.status,
                data: response.data
            });
        }
        return response;
    },
    error => {
        console.error('Response error:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message,
            data: error.response?.data
        });
        return Promise.reject(error);
    }
);

// Enhanced error handler
const handleApiError = (error, operation) => {
    if (error.response) {
        const status = error.response.status;
        let message = error.response.data?.message || `Error: ${operation} failed`;

        switch (status) {
            case 401:
                message = 'Sesi telah berakhir. Silakan login kembali.';
                break;
            case 403:
                message = 'Anda tidak memiliki akses untuk operasi ini.';
                break;
            case 404:
                message = 'Data tidak ditemukan.';
                break;
            case 405:
                message = 'Metode request tidak diizinkan.';
                break;
            case 422:
                message = 'Data yang dikirim tidak valid.';
                break;
            case 429:
                message = 'Terlalu banyak request. Silakan coba lagi nanti.';
                break;
            case 500:
                message = 'Terjadi kesalahan pada server.';
                break;
        }

        throw {
            status,
            message,
            data: error.response.data
        };
    } else if (error.request) {
        throw {
            status: 503,
            message: 'Tidak dapat terhubung ke server. Periksa koneksi Anda.'
        };
    } else {
        throw {
            status: 500,
            message: 'Terjadi kesalahan dalam aplikasi.',
            error: error.message
        };
    }
};

// API Services
export const authAPI = {
    login: async (credentials) => {
        try {
            const response = await apiClient.post('/auth.php', credentials);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Login');
        }
    },
    logout: async () => {
        try {
            const response = await apiClient.post('/auth.php/logout');
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Logout');
        }
    }
};

export const suratAPI = {
    getAllSurat: async () => {
        try {
            const response = await apiClient.get('/surat.php');
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Mengambil data surat');
        }
    },
    
    createSurat: async (data) => {
        try {
            const response = await apiClient.post('/surat.php', data);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Membuat surat');
        }
    },
    
    updateSurat: async (id, data) => {
        try {
            const response = await apiClient.put(`/surat.php?id=${id}`, data);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Mengupdate surat');
        }
    },
    
    deleteSurat: async (id) => {
        try {
            const response = await apiClient.delete(`/surat.php?id=${id}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Menghapus surat');
        }
    }
};

export const userAPI = {
    getAllUsers: async () => {
        try {
            const response = await apiClient.get('/user.php');
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Mengambil data users');
        }
    },
    
    createUser: async (data) => {
        try {
            const response = await apiClient.post('/user.php', data);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Membuat user');
        }
    },
    
    updateUser: async (id, data) => {
        try {
            const response = await apiClient.put(`/user.php?id=${id}`, data);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Mengupdate user');
        }
    },
    
    deleteUser: async (id) => {
        try {
            const response = await apiClient.delete(`/user.php?id=${id}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Menghapus user');
        }
    }
};

// Export services individually and as a default object
export { apiClient };

// Remove default export to avoid confusion
// Now you should import specific APIs like:
// import { authAPI, suratAPI, userAPI } from './api';