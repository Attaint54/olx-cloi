import axios from 'axios';

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
   * Logs in a user using the DummyJSON authentication route
   */
  async login(username, password) {
    try {
      const response = await axios.post('https://dummyjson.com/auth/login', {
        username,
        password,
        expiresInMins: 60
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      const data = response.data;
      const user = {
        id: data.id,
        username: data.username,
        email: data.email,
        name: `${data.firstName} ${data.lastName}`,
        avatar: data.image || `https://api.dicebear.com/7.x/adventurer/svg?seed=${data.username}`,
        token: data.token
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('olx_user_session', JSON.stringify(user));
      }
      return user;
    } catch (error) {
      console.error('Auth Service Login Error:', error);
      const errMsg = error.response?.data?.message || 'Invalid username or password';
      throw new Error(errMsg);
    }
  },

  /**
   * Simulates user registration
   */
  async register(name, username, email, password) {
    // Simulate endpoint roundtrip delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const user = {
      id: `usr_${Date.now()}`,
      username,
      email,
      name,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
      token: 'mock-jwt-token-' + Math.random().toString(36).substring(2)
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('olx_user_session', JSON.stringify(user));
    }
    return user;
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
