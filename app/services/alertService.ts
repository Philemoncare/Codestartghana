import { apiFetch } from "@/lib/api";

export type AlertType = 'critical' | 'warning' | 'info' | 'success';
export type AlertSource = 'system' | 'admin' | 'student';
export type AlertCategory = 'system' | 'registration' | 'payment' | 'student' | 'security' | 'delivery';

export interface Alert {
  id: number;
  type: AlertType;
  title: string;
  message: string;
  source: AlertSource;
  category: AlertCategory;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
}

export interface AlertFilters {
  type?: string;
  category?: string;
  status?: 'read' | 'unread' | 'archived' | 'all';
  search?: string;
  page?: number;
  limit?: number;
}

export interface AlertsResponse {
  alerts: Alert[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const alertService = {
  async getAlerts(filters: AlertFilters = {}): Promise<AlertsResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    return apiFetch(`/api/admin/alerts?${params.toString()}`);
  },

  async updateAlert(id: number, data: Partial<Alert>) {
    return apiFetch(`/api/admin/alerts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async performAction(action: 'mark_read' | 'mark_unread' | 'archive' | 'restore' | 'mark_all_read', ids?: number[]) {
    return apiFetch('/api/admin/alerts', {
      method: 'PATCH',
      body: JSON.stringify({ action, ids }),
    });
  },

  async deleteAlert(id: number) {
    return apiFetch(`/api/admin/alerts/${id}`, {
      method: 'DELETE',
    });
  },

  async deleteMultiple(ids: number[]) {
    return apiFetch('/api/admin/alerts', {
      method: 'DELETE',
      body: JSON.stringify({ action: 'delete_selected', ids }),
    });
  },

  async clearAll(type: 'all' | 'archived' = 'all') {
    return apiFetch('/api/admin/alerts', {
      method: 'DELETE',
      body: JSON.stringify({ action: type === 'all' ? 'clear_all' : 'clear_archived' }),
    });
  }
};
