import { apiClient } from './client';
import { SiteSettingDto, UpdateSiteSettingsPayload } from '@/types/api';

export const settingsService = {
  /**
   * Fetch public store settings (Store identity, About Us, announcement banner, contact, socials, policies).
   * Endpoint: GET /api/settings
   * Access: Public (no auth required)
   */
  getSettings: async (): Promise<SiteSettingDto> => {
    const res = await apiClient.get<SiteSettingDto>('/api/settings');
    return res.data;
  },

  /**
   * Update live store settings without redeployment.
   * Endpoint: PUT /api/settings
   * Access: Admin only
   */
  updateSettings: async (payload: UpdateSiteSettingsPayload): Promise<SiteSettingDto> => {
    const res = await apiClient.put<SiteSettingDto>('/api/settings', payload);
    return res.data;
  },
};
