import { apiFetch } from "@/lib/api";

export const registerService = {
  async register(data: any) {
    return apiFetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        whatsapp: data.whatsapp,
        age: data.age,
        school: data.school,
        experience: data.experience,
        motivation: data.motivation
      }),
    });
  }
};
