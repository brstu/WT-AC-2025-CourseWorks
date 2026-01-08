import api from "./client";
import { Invoice } from "../types/models";

export default {
  list: async (params?: { search?: string }): Promise<Invoice[]> => {
    const res = await api.get("/api/v1/invoices", { params });
    return res.data || [];
  },
  get: async (id: string) => {
    const res = await api.get(`/api/v1/invoices/${id}`);
    return res.data as Invoice;
  },
  create: async (payload: Partial<Invoice>) => {
    const res = await api.post("/api/v1/invoices", payload);
    return res.data as Invoice;
  },
  update: async (id: string, payload: Partial<Invoice>) => {
    const res = await api.put(`/api/v1/invoices/${id}`, payload);
    return res.data as Invoice;
  },
  remove: async (id: string) => {
    const res = await api.delete(`/api/v1/invoices/${id}`);
    return res.data;
  },
  countRelated: async (id: string) => {
    const res = await api.get(`/api/v1/invoices/${id}/count-related`);
    return res.data as { items: number };
  },
};
