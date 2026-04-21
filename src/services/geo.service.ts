import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import type { District, Region } from '@/lib/types';

export const geoService = {
  listRegions: () => api.get<Region[]>(endpoints.geo.regions).then((r) => r.data),

  listDistricts: (regionId: number) =>
    api
      .get<District[]>(endpoints.geo.districts, { params: { regionId } })
      .then((r) => r.data),
};
