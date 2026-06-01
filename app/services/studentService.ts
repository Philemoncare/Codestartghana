import { apiFetch } from "@/lib/api";

export const studentService = {
  async login(email: string, password: string) {
    return apiFetch('/api/student/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  },

  async getDashboardData() {
    return apiFetch('/api/student/dashboard', {
      method: 'GET',
    });
  },

  async getProfile() {
    return apiFetch('/api/student/profile');
  },

  async updateProfile(data: any) {
    return apiFetch('/api/student/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async updateProfilePhoto(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return apiFetch('/api/student/profile/photo', {
      method: 'POST',
      body: formData,
    });
  },

  async logout() {
    return apiFetch('/api/student/logout', {
      method: 'POST',
    });
  }
};
