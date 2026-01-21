import { api } from './http';

export type Service = {
  _id: string;
  name: string;
  price: number;
  durationMin: number;
  description?: string;
  isActive?: boolean;
};

export type Master = {
  _id: string;
  name: string;
  bio?: string;
  isActive?: boolean;
  services: Service[];
};

export type MastersResponse = { items: Master[] };

export function getMasters() {
  return api<MastersResponse>('/masters');
}
