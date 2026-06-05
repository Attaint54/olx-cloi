import axios from 'axios';

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000';

// Get current user from local storage
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
  /**
   * Logs in a user via backend
   */
  async login(username, password) {
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
      console.error('Auth Service Login Error:', error);
      const errMsg = error.response?.data?.error || 'Invalid username or password';
      throw new Error(errMsg);
    }
  },

  /**
   * Registers user via backend with Cloudinary image upload
   */
  async register(name, username, email, password, profilePicFile = null) {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    if (profilePicFile) {
      formData.append('image', profilePicFile);
    }

    try {
      const response = await axios.post(`${AUTH_URL}/register`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
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
      console.error('Register error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || error.message);
    }
  },

  /**
   * Sign out and clear cached credentials
   */
  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('olx_user_session');
    }
  }
};
