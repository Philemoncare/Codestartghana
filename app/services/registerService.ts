import { apiFetch } from "@/lib/api";

export const registerService = {
  async register(data: any) {
    return apiFetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }
};
