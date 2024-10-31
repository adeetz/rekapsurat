// src/contexts/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

const BASE_URL = 'https://doc.gamatekno.co.id'; // Sesuaikan dengan base URL yang benar
const RETRY_DELAY = 2000; // 2 detik
const MAX_RETRIES = 3;

// Custom axios instance dengan konfigurasi
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // Increased timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Fungsi untuk retry request
  const retryRequest = async (fn, params) => {
    try {
      const result = await fn(params);
      setRetryCount(0);
      return result;
    } catch (error) {
      if (retryCount < MAX_RETRIES && (error.response?.status === 502 || !error.response)) {
        setRetryCount(prev => prev + 1);
        toast.error(`Koneksi terputus. Mencoba ulang... (${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return retryRequest(fn, params);
      }
      throw error;
    }
  };

  // Handle auth status
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setUser(user);
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function dengan retry mechanism
  const login = async (credentials) => {
    try {
      setLoading(true);

      const loginRequest = async (creds) => {
        const response = await api.post('/auth.php', creds);
        return response.data;
      };

      const data = await retryRequest(loginRequest, credentials);

      if (data.success) {
        const userData = {
          ...data.user,
          token: data.token
        };

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Set token untuk subsequent requests
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        
        navigate('/dashboard');
        toast.success('Login berhasil!');
      } else {
        throw new Error(data.message || 'Login gagal');
      }
    } catch (error) {
      let errorMessage = 'Terjadi kesalahan saat login';

      if (error.response) {
        // Server returned an error response
        if (error.response.status === 502) {
          errorMessage = 'Server sedang tidak tersedia. Silakan coba beberapa saat lagi.';
        } else {
          errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (error.request) {
        // Request was made but no response
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
      }

      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
      setRetryCount(0);
    }
  };

  const logout = () => {
    try {
      // Clear all auth data
      setUser(null);
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      
      navigate('/login');
      toast.success('Logout berhasil');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Terjadi kesalahan saat logout');
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Loading Component
const LoadingSpinner = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="flex flex-col items-center p-5 bg-white rounded-lg">
      <div className="w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
      <p className="mt-3 text-gray-600">Mohon tunggu...</p>
    </div>
  </div>
);

// Protected Route Component
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return navigate('/login', { state: { from: location.pathname }, replace: true });
  }

  return children;
}

export default AuthContext;