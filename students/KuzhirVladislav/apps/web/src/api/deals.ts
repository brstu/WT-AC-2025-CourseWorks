import api from "./client";
import { Deal } from "../types/models";

export default {
  list: async (params?: { search?: string }): Promise<Deal[]> => {
    const res = await api.get("/api/v1/deals", { params });
    return res.data || [];
  },
  get: async (id: string) => {
    const res = await api.get(`/api/v1/deals/${id}`);
    return res.data as Deal;
  },
  create: async (payload: Partial<Deal>) => {
    const res = await api.post("/api/v1/deals", payload);
    return res.data as Deal;
  },
  update: async (id: string, payload: Partial<Deal>) => {
    const res = await api.put(`/api/v1/deals/${id}`, payload);
    return res.data as Deal;
  },
  remove: async (id: string) => {
    const res = await api.delete(`/api/v1/deals/${id}`);
    return res.data;
  },
  countRelated: async (id: string) => {
    const res = await api.get(`/api/v1/deals/${id}/count-related`);
    return res.data as { tasks: number; invoices: number };
  },
};
