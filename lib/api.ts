const BASE_URL = "http://localhost:3000";

export const API = {
  auth: {
    signup: `${BASE_URL}/api/auth/signup`,
    login: `${BASE_URL}/api/auth/login`,
    logout: `${BASE_URL}/api/auth/logout`,
  },

  notes: `${BASE_URL}/api/notes`,

  shared: (id: string) => `${BASE_URL}/api/shared/${id}`,

  noteById: (id: string) => `${BASE_URL}/api/notes/${id}`,

  analytics: `${BASE_URL}/api/analytics`,


  generateSummary: (id: string) => `${BASE_URL}/api/notes/${id}/generateSummary`
};