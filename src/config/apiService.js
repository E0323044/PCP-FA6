const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL;

// ============================================================
// STEP 1: Get token using student credentials
// ============================================================
const getToken = async (registerNo, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      registerNo,
      password,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to get token'
    );
  }
};

// ============================================================
// STEP 2: Fetch dataset using the token
// ============================================================
const fetchDataset = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/data`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch dataset'
    );
  }
};

module.exports = { getToken, fetchDataset };
