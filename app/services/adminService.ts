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

  async resendWelcomeEmail(registrationId: number) {
    return apiFetch('/api/admin/resend-welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registrationId }),
    });
  }
};
