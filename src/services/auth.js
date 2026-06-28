import axios from 'axios';

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL;

if (typeof window !== 'undefined') {
  console.log('[Auth] Using AUTH_URL:', AUTH_URL);
}

export function getSavedSession() {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem('olx_user_session');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.error('Error parsing user session:', e);
    return null;
  }
}

export const OLX_Auth = {
  async login(username, password) {
    if (!AUTH_URL) {
      throw new Error('AUTH_URL is not configured. Set NEXT_PUBLIC_AUTH_URL in your environment variables.');
    }
    console.log('[Auth] POST', `${AUTH_URL}/login`);
    try {
      const response = await axios.post(`${AUTH_URL}/login`, {
        username,
        password,
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      const data = response.data;
      const user = {
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        name: data.user.name,
        avatar: data.user.profilePicture || '',
        token: data.token
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('olx_user_session', JSON.stringify(user));
      }
      return user;
    } catch (error) {
      console.error('[Auth] Login Error:', error.config?.url || AUTH_URL);
      if (error.response) {
        console.error('[Auth] Status:', error.response.status, 'Body:', JSON.stringify(error.response.data).substring(0, 200));
      } else if (error.request) {
        console.error('[Auth] Network Error - no response received');
      }
      if (!error.response) {
        throw new Error('Network Error: Cannot reach the server. Check your connection or the API URL.');
      }
      const errMsg = error.response?.data?.message || error.response?.data?.error || 'Invalid username or password';
      throw new Error(errMsg);
    }
  },

  async register(name, username, email, password, profilePicFile = null) {
    if (!AUTH_URL) {
      throw new Error('AUTH_URL is not configured. Set NEXT_PUBLIC_AUTH_URL in your environment variables.');
    }
    const formData = new FormData();
    formData.append('name', name);
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    if (profilePicFile) {
      formData.append('image', profilePicFile);
    }

    console.log('[Auth] POST', `${AUTH_URL}/register`);
    try {
      const response = await axios.post(`${AUTH_URL}/register`, formData);

      const data = response.data;
      const user = {
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        name: data.user.name,
        avatar: data.user.profilePicture || '',
        token: data.token
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('olx_user_session', JSON.stringify(user));
      }
      return user;
    } catch (error) {
      console.error('[Auth] Register Error:', error.config?.url || AUTH_URL);
      if (error.response) {
        console.error('[Auth] Status:', error.response.status, 'Body:', JSON.stringify(error.response.data).substring(0, 200));
      } else if (error.request) {
        console.error('[Auth] Network Error - no response received');
      }
      if (!error.response) {
        throw new Error('Network Error: Cannot reach the server. Check your connection or the API URL.');
      }
      throw new Error(error.response?.data?.message || error.response?.data?.error || error.message);
    }
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('olx_user_session');
    }
  }
};
