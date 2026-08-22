import * as hooks from '../../hooks';

describe('Hooks Index', () => {
  it('should export hooks', () => {
    const hookNames = Object.keys(hooks);
    expect(hookNames.length).toBeGreaterThanOrEqual(11);
  });

  it('should export all hooks as functions', () => {
    const hookNames = Object.keys(hooks);
    hookNames.forEach((name) => {
      expect(typeof hooks[name as keyof typeof hooks]).toBe('function');
    });
  });

  it('should have expected hook names', () => {
    const hookNames = Object.keys(hooks);
    // These are the actual named exports from the hooks
    const expectedHooks = [
      'useCurrentUser',
      'useLogin',
      'useRegister',
      'useForgotPassword',
      'useGroups',
      'useGroup',
      'useCreateGroup',
      'useUpdateGroup',
      'useDeleteGroup',
      'useSyncGroupVideos',
      'useBulkUpdateGroupOrder',
      'useGroupSubgroups',
      'useChannels',
      'useChannel',
      'useChannelsByGroup',
      'useCreateChannel',
      'useUpdateChannel',
      'useDeleteChannel',
      'useBatchUpdateChannels',
      'useAnimes',
      'useAnime',
      'useWebsites',
      'useDeleteWebsite',
      'useWebsitesInfinite',
      'useShareLinks',
      'useCreateShareLink',
      'useDeleteShareLink',
      'useDashboard',
      'useBlogPosts',
      'useBlogPost',
      'useBlogInfinite',
      'useGroupShelf',
      'useGroupShelves',
      'useUpdateGroupShelf',
      'useCopyShelf',
      'useGoogleLogin',
      'useDiscordLogin',
      'useAppleLogin',
      'useAppleMobileAuth',
      'useHandleOAuthCallback',
      'useOAuthLoading',
      'useIsOAuthLoading',
    ];
    
    expectedHooks.forEach((hook) => {
      expect(hookNames).toContain(hook);
    });
  });
});
