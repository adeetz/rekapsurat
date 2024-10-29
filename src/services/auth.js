// src/services/auth.js
import axios from 'axios';

const authAPI = axios.create({
  baseURL: 'http://localhost/rekapsurat/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const login = async (username, password) => {
  try {
    const response = await authAPI.post('/auth.php', {
      username,
      password
    });

    if (response.data.status === 'success') {
      // Simpan data user ke localStorage
      localStorage.setItem('user', JSON.stringify(response.data.data));
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error('Login error:', error);
    throw new Error(error.response?.data?.message || 'Gagal login');
  }
};

export const logout = () => {
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};