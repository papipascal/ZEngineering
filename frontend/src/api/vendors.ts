import client from './client';

export interface Vendor {
  id: string;
  name: string;
  country: string | null;
  specialties: Array<{ id: string; equipmentType: string }>;
}

export const vendorApi = {
  search: (q: string) =>
    client.get('/api/discussions/search', { params: { q } })
      .then(res => res.data.vendors as Vendor[]),
};
