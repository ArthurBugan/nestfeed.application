import apiClient from '@/api/client';
import { dashboardApi } from '@/api/endpoints/dashboard';

jest.mock('@/api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

describe('Dashboard API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTotals', () => {
    it('should call GET /api/v2/dashboard/total and return data', async () => {
      const mockData = { groups: 10, channels: 25, youtubeChannels: 15, sharedGroups: 3, animeChannels: 8, websites: 5, animes: 100 };
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockData });

      const result = await dashboardApi.getTotals();

      expect(apiClient.get).toHaveBeenCalledWith('/api/v2/dashboard/total');
      expect(result).toEqual(mockData);
    });

    it('should handle partial data', async () => {
      const mockData = { groups: 5, channels: 10 };
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockData });

      const result = await dashboardApi.getTotals();

      expect(result).toEqual(mockData);
    });
  });
});
