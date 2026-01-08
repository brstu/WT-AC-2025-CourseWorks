import api from "./client";
import { Client } from "../types/models";

export default {
  list: async (params?: { search?: string }): Promise<Client[]> => {
    const res = await api.get("/api/v1/clients", { params });
    return res.data || [];
  },
  get: async (id: string) => {
    const res = await api.get(`/api/v1/clients/${id}`);
    return res.data as Client;
  },
  create: async (payload: Partial<Client>) => {
    const res = await api.post("/api/v1/clients", payload);
    return res.data;
  },
  update: async (id: string, payload: Partial<Client>) => {
    const res = await api.put(`/api/v1/clients/${id}`, payload);
    return res.data;
  },
  remove: async (id: string) => {
    const res = await api.delete(`/api/v1/clients/${id}`);
    return res.data;
  },
  countRelated: async (id: string) => {
    const res = await api.get(`/api/v1/clients/${id}/count-related`);
    return res.data as { deals: number; tasks: number; invoices: number };
  },
};
