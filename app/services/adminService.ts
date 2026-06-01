import { apiFetch } from "@/lib/api";

export const adminService = {
  async getDashboardData() {
    return apiFetch('/api/admin/data');
  },

  async getRegistrations() {
    return apiFetch('/api/admin/registrations');
  },

  async getPayments() {
    return apiFetch('/api/admin/payments');
  },

  async updatePaymentStatus(id: string, status: string) {
    return apiFetch('/api/admin/payment-status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
  },

  async deleteRegistration(id: number) {
    return apiFetch(`/api/admin/registrations?id=${id}`, {
      method: 'DELETE',
    });
  },

  async resendWelcomeEmail(registrationId: number) {
    return apiFetch('/api/admin/resend-welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registrationId }),
    });
  },

  async getTimetable() {
    return apiFetch('/api/admin/timetable');
  },

  async addTimetableEntry(data: any) {
    return apiFetch('/api/admin/timetable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async updateTimetableEntry(data: any) {
    return apiFetch('/api/admin/timetable', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async deleteTimetableEntry(id: number) {
    return apiFetch(`/api/admin/timetable?id=${id}`, {
      method: 'DELETE',
    });
  },

  async markAttendance(data: { registrationId: number, timetableId: number }) {
    return apiFetch('/api/admin/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async getAttendance(registrationId?: number) {
    const url = registrationId ? `/api/admin/attendance?registrationId=${registrationId}` : '/api/admin/attendance';
    return apiFetch(url);
  },

  async removeAttendance(id: number) {
    return apiFetch(`/api/admin/attendance?id=${id}`, {
      method: 'DELETE',
    });
  },

  async getSetting(key: string) {
    return apiFetch(`/api/admin/settings?key=${key}`);
  },

  async updateSetting(key: string, value: string) {
    return apiFetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
  }
};
