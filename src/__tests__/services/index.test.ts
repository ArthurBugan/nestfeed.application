import storage from '../../services/storage';

describe('Services Index', () => {
  it('should export storage', () => {
    expect(storage).toBeDefined();
  });

  it('should have all storage methods', () => {
    expect(storage.setToken).toBeDefined();
    expect(storage.getToken).toBeDefined();
    expect(storage.removeToken).toBeDefined();
    expect(storage.setObject).toBeDefined();
    expect(storage.getObject).toBeDefined();
    expect(storage.remove).toBeDefined();
  });

  it('should have correct method signatures', () => {
    expect(typeof storage.setToken).toBe('function');
    expect(typeof storage.getToken).toBe('function');
    expect(typeof storage.removeToken).toBe('function');
    expect(typeof storage.setObject).toBe('function');
    expect(typeof storage.getObject).toBe('function');
    expect(typeof storage.remove).toBe('function');
  });
});
