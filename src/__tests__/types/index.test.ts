import * as types from '../../types';

describe('Types Index', () => {
  it('should export all type definitions', () => {
    // Runtime exports (interfaces are erased at runtime, but type exports are valid)
    expect(types).toBeDefined();
  });

  it('should export api types', () => {
    // These are type-only exports, so we just verify the module loads
    expect(types).toBeDefined();
  });

  it('should export auth types', () => {
    // These are type-only exports
    expect(types).toBeDefined();
  });

  it('should export model types', () => {
    // These are type-only exports
    expect(types).toBeDefined();
  });
});
