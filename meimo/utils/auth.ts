// utils/auth.ts
export interface User {
  email: string;
  name: string;
}

// Helper function untuk handle localStorage dengan safe
const safeLocalStorage = {
  setItem: (key: string, value: string): boolean => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, value);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error setting localStorage:', error);
      return false;
    }
  },
  
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem(key);
      }
      return null;
    } catch (error) {
      console.error('Error getting localStorage:', error);
      return null;
    }
  },
  
  removeItem: (key: string): boolean => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing localStorage:', error);
      return false;
    }
  }
};

export const loginUser = (email: string, password: string): boolean => {
  console.log('🔐 Attempting login for:', email);
  
  const validUsers = [
    { email: 'admin@rasamanado.com', password: 'admin123', name: 'Administrator' },
    { email: 'user@example.com', password: 'user123', name: 'Regular User' }
  ];

  const user = validUsers.find(u => u.email === email && u.password === password);
  
  if (user) {
    const userData = { email: user.email, name: user.name };
    const token = 'demo-token-' + Date.now();
    
    // Gunakan safeLocalStorage
    const userSuccess = safeLocalStorage.setItem('rasamanado_user', JSON.stringify(userData));
    const tokenSuccess = safeLocalStorage.setItem('rasamanado_token', token);
    
    if (userSuccess && tokenSuccess) {
      console.log('✅ Login successful! User:', user.name);
      return true;
    } else {
      console.log('❌ Login failed - localStorage error');
      return false;
    }
  }
  
  console.log('❌ Login failed - invalid credentials for:', email);
  return false;
};

export const logoutUser = (): void => {
  console.log('🚪 Logging out...');
  
  // Gunakan safeLocalStorage
  safeLocalStorage.removeItem('rasamanado_user');
  safeLocalStorage.removeItem('rasamanado_token');
  
  console.log('✅ Logout successful');
};

export const isLoggedIn = (): boolean => {
  // Gunakan safeLocalStorage
  const token = safeLocalStorage.getItem('rasamanado_token');
  const isLoggedIn = !!token;
  
  console.log('🔍 isLoggedIn check - token exists:', isLoggedIn);
  return isLoggedIn;
};

export const getCurrentUser = (): User | null => {
  const userStr = safeLocalStorage.getItem('rasamanado_user');
  
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      console.log('👤 getCurrentUser:', user.name);
      return user;
    } catch (error) {
      console.error('❌ Error parsing user data:', error);
      return null;
    }
  }
  
  console.log('👤 getCurrentUser: no user found');
  return null;
};