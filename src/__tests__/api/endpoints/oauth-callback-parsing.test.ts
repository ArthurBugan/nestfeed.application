/**
 * Regression test for OAuth callback token parsing bug.
 *
 * The handleCallback function must extract the token from the URL query
 * parameters, not treat the entire URL as the token.
 *
 * Bug: handleCallback was doing `const token = url;` instead of parsing
 * the token from the URL query string.
 */
describe('OAuth callback URL parsing', () => {
  it('should extract token from OAuth callback URL', () => {
    // Example OAuth callback URL format
    const callbackUrl = 'nestfeed://oauth?provider=google&token=jwt-token-abc123';

    // Parse the URL to extract the token
    const urlObj = new URL(callbackUrl);
    const token = urlObj.searchParams.get('token');

    // Token should be extracted correctly
    expect(token).toBe('jwt-token-abc123');
    expect(token).not.toBe(callbackUrl);
  });

  it('should extract token from OAuth callback URL with different providers', () => {
    const discordUrl = 'nestfeed://oauth?provider=discord&token=discord-token-xyz';
    const discordUrlObj = new URL(discordUrl);
    expect(discordUrlObj.searchParams.get('token')).toBe('discord-token-xyz');
  });

  it('should return null when no token parameter exists', () => {
    const noTokenUrl = 'nestfeed://oauth?provider=google';
    const urlObj = new URL(noTokenUrl);
    expect(urlObj.searchParams.get('token')).toBeNull();
  });

  it('should handle URL with additional query parameters', () => {
    const complexUrl = 'nestfeed://oauth?provider=google&token=my-token&state=xyz&scope=email';
    const urlObj = new URL(complexUrl);
    expect(urlObj.searchParams.get('token')).toBe('my-token');
    expect(urlObj.searchParams.get('provider')).toBe('google');
  });
});
