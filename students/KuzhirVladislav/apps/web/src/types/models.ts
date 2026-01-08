export type User = {
  id: number;
  username: string;
  email: string;
  roles?: string;
};

export type Client = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  userId?: number;
  address?: string;
  notes?: string;
  createdAt?: string;
};

export type Task = {
  id: number;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  dealId?: number;
  userId?: number;
};

export type Deal = {
  id: number;
  title: string;
  amount?: number;
  stageId?: number;
  clientId?: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  client?: Client;
  stage?: Stage;
};
export type Stage = {
  id: number;
  name: string;
  stageOrder: number;
};

export type Invoice = {
  id: number;
  number: string;
  amount: number;
  status?: "draft" | "sent" | "paid";
  issueDate: string;
  dealId?: number;
  userId?: number;
  clientId?: number;
  client: Client;
  deal?: Deal;
};
