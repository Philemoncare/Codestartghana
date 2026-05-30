import { apiFetch } from "@/lib/api";

export const paymentService = {
  async submitPayment(paymentData: {
    registrationId: string;
    studentName: string;
    transactionId: string;
    senderNumber: string;
    file: File;
  }) {
    const formData = new FormData();
    formData.append('registrationId', paymentData.registrationId);
    formData.append('studentName', paymentData.studentName);
    formData.append('transactionId', paymentData.transactionId);
    formData.append('senderNumber', paymentData.senderNumber);
    formData.append('file', paymentData.file);

    return apiFetch('/api/payment', {
      method: 'POST',
      body: formData,
    });
  }
};
