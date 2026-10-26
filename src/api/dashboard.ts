import { apiClient } from './client';
import { DashboardSummaryResponse } from '@/types/api';

export const dashboardService = {
  /**
   * Fetch admin analytics summary KPIs, sales trend points, low stock warnings,
   * top selling products, and recent orders.
   * Endpoint: GET /api/dashboard/summary?days={days}
   * Access: Admin only
   */
  getSummary: async (days: number = 30): Promise<DashboardSummaryResponse> => {
    const res = await apiClient.get<DashboardSummaryResponse>(`/api/dashboard/summary?days=${days}`);
    return res.data;
  },
};
