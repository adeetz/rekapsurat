// src/services/api.js
import axios from 'axios';

const BASE_URL = 'http://localhost/rekapsurat/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// API untuk surat
export const suratAPI = {
  getAllSurat: async () => {
    try {
      const response = await apiClient.get('/surat.php');
      return response.data;
    } catch (error) {
      console.error('Error getting surat:', error.response?.data);
      throw error;
    }
  },

  createSurat: async (data) => {
    try {
      const response = await apiClient.post('/surat.php', JSON.stringify(data));
      return response.data;
    } catch (error) {
      console.error('Error creating surat:', error.response?.data);
      throw error;
    }
  },

  updateSurat: async (id, data) => {
    try {
      const response = await apiClient.put(`/surat.php/${id}`, JSON.stringify(data));
      return response.data;
    } catch (error) {
      console.error('Error updating surat:', error.response?.data);
      throw error;
    }
  },

  deleteSurat: async (id) => {
    try {
      const response = await apiClient.delete(`/surat.php/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting surat:', error.response?.data);
      throw error;
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
      console.error('Error getting users:', error.response?.data);
      throw error;
    }
  },

  createUser: async (data) => {
    try {
      console.log('Sending data:', data); // Debug log
      const response = await apiClient.post('/user.php', JSON.stringify(data));
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error.response?.data);
      throw error;
    }
  },

  updateUser: async (id, data) => {
    try {
      const response = await apiClient.put(`/user.php/${id}`, JSON.stringify(data));
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error.response?.data);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await apiClient.delete(`/user.php/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error.response?.data);
      throw error;
    }
  }
};