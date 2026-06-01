import { apiFetch } from "@/lib/api";

export interface Alert {
  id: number;
  type: 'critical' | 'warning' | 'info';
  message: string;
  source: 'system' | 'admin' | 'student';
  is_read: boolean;
  created_at: string;
}

export const alertService = {
  async getAlerts(filters: { type?: string; status?: string } = {}) {
    const params = new URLSearchParams(filters as any);
    return apiFetch(`/api/admin/alerts?${params.toString()}`);
  },

  async markAsRead(id: number) {
    return apiFetch(`/api/admin/alerts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_read: true }),
    });
  },

  async markAllRead() {
    return apiFetch('/api/admin/alerts', {
      method: 'PATCH',
      body: JSON.stringify({ action: 'mark_all_read' }),
    });
  },

  async deleteAlert(id: number) {
    return apiFetch(`/api/admin/alerts/${id}`, {
      method: 'DELETE',
    });
  },

  async clearAll() {
    return apiFetch('/api/admin/alerts', {
      method: 'DELETE',
      body: JSON.stringify({ action: 'clear_all' }),
    });
  }
};
