import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

export function setAuthToken(token) {
  if (token) {
    const expiry = localStorage.getItem('tokenExpiry');
    if (expiry && Date.now() > expiry) {
      alert("Sua sessão expirou. Faça login novamente.");
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiry');
      window.location.href = '/login';
      return;
    }
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

const token = localStorage.getItem('token');
if (token) setAuthToken(token);

export const createComment = (commentData) => api.post('/comments', commentData);
export const getComments = () => api.get('/comments');
export const getUserComments = () => api.get('/comments/user');

export default api;