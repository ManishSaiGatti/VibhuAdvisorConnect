// Authentication utilities
export const getToken = () => sessionStorage.getItem('token');
export const getUserData = () => {
  const userData = sessionStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};

export const setAuthData = (token, user) => {
  sessionStorage.setItem('token', token);
  sessionStorage.setItem('user', JSON.stringify(user));
};

export const clearAuthData = () => {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
};

export const isAuthenticated = () => {
  const token = getToken();
  const user = getUserData();
  return !!(token && user);
};
