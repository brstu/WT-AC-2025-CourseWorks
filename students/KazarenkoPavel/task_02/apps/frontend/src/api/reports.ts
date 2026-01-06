import { apiClient, extractData } from './client';
import { DailyReport, WeeklyReport, MonthlyReport, TagReport } from '../types';

export const reportsApi = {
  async daily(date: string, userId?: string): Promise<DailyReport> {
    const params = new URLSearchParams();
    params.set('date', date);
    if (userId) params.set('userId', userId);
    
    const response = await apiClient.get(`/reports/daily?${params.toString()}`);
    return extractData(response);
  },

  async weekly(weekStart: string, userId?: string): Promise<WeeklyReport> {
    const params = new URLSearchParams();
    params.set('weekStart', weekStart);
    if (userId) params.set('userId', userId);
    
    const response = await apiClient.get(`/reports/weekly?${params.toString()}`);
    return extractData(response);
  },

  async monthly(month: string, userId?: string): Promise<MonthlyReport> {
    const params = new URLSearchParams();
    params.set('month', month);
    if (userId) params.set('userId', userId);
    
    const response = await apiClient.get(`/reports/monthly?${params.toString()}`);
    return extractData(response);
  },

  async byTag(from: string, to: string, userId?: string): Promise<TagReport[]> {
    const params = new URLSearchParams();
    params.set('from', from);
    params.set('to', to);
    if (userId) params.set('userId', userId);
    
    const response = await apiClient.get(`/reports/by-tag?${params.toString()}`);
    return extractData(response);
  },

  async exportData(from: string, to: string, format: 'csv' | 'json', userId?: string): Promise<string | unknown> {
    const params = new URLSearchParams();
    params.set('from', from);
    params.set('to', to);
    params.set('format', format);
    if (userId) params.set('userId', userId);
    
    const response = await apiClient.get(`/reports/export?${params.toString()}`);
    
    if (format === 'csv') {
      return response.data;
    }
    return extractData(response);
  },
};
