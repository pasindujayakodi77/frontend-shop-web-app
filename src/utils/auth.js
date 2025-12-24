export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

// Get user ID from localStorage
export const getUserId = () => {
  return localStorage.getItem("userId");
};

// Get user-specific localStorage key
export const getUserKey = (key) => {
  const userId = getUserId();
  return userId ? `user_${userId}_${key}` : key;
};

// Get user-specific data from localStorage
export const getUserData = (key, defaultValue = null) => {
  const userKey = getUserKey(key);
  const data = localStorage.getItem(userKey);
  return data ? JSON.parse(data) : defaultValue;
};

// Set user-specific data in localStorage
export const setUserData = (key, value) => {
  const userKey = getUserKey(key);
  localStorage.setItem(userKey, JSON.stringify(value));
};

// Remove user-specific data from localStorage
export const removeUserData = (key) => {
  const userKey = getUserKey(key);
  localStorage.removeItem(userKey);
};

// Clear all user data (call on logout)
export const clearUserData = () => {
  const userId = getUserId();
  if (userId) {
    // Remove all user-specific keys
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(`user_${userId}_`)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
  localStorage.removeItem("userId");
};