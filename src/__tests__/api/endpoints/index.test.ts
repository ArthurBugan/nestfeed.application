import * as endpoints from '@/api/endpoints';

describe('API Endpoints Index', () => {
  it('should export animesApi', () => {
    expect(endpoints.animesApi).toBeDefined();
  });

  it('should export authApi', () => {
    expect(endpoints.authApi).toBeDefined();
  });

  it('should export blogApi', () => {
    expect(endpoints.blogApi).toBeDefined();
  });

  it('should export channelsApi', () => {
    expect(endpoints.channelsApi).toBeDefined();
  });

  it('should export dashboardApi', () => {
    expect(endpoints.dashboardApi).toBeDefined();
  });

  it('should export groupsApi', () => {
    expect(endpoints.groupsApi).toBeDefined();
  });

  it('should export groupShelfApi', () => {
    expect(endpoints.groupShelfApi).toBeDefined();
  });

  it('should export shareLinksApi', () => {
    expect(endpoints.shareLinksApi).toBeDefined();
  });

  it('should export websitesApi', () => {
    expect(endpoints.websitesApi).toBeDefined();
  });

  it('should export all endpoints', () => {
    const endpointNames = Object.keys(endpoints);
    expect(endpointNames.length).toBeGreaterThanOrEqual(9);
  });
});
