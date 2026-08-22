import type {
  ApiResponse,
  ApiError,
  Pagination,
  PaginatedResponse,
  PaginationParams,
  LoginCredentials,
  RegisterCredentials,
  User,
  Group,
  Channel,
  Anime,
  Website,
  ShareLink,
  GroupShelf,
  BlogPost,
  DashboardTotals,
} from '@/types/index';

describe('Type Definitions', () => {
  describe('ApiResponse', () => {
    it('should have data and optional message', () => {
      const response: ApiResponse<{ id: string }> = {
        data: { id: '1' },
        message: 'Success',
      };
      expect(response.data).toEqual({ id: '1' });
      expect(response.message).toBe('Success');
    });
  });

  describe('ApiError', () => {
    it('should have message, status, and optional errors', () => {
      const error: ApiError = {
        message: 'Something went wrong',
        status: 500,
        errors: { field: ['Error message'] },
      };
      expect(error.message).toBe('Something went wrong');
      expect(error.status).toBe(500);
      expect(error.errors).toEqual({ field: ['Error message'] });
    });
  });

  describe('Pagination', () => {
    it('should have all pagination fields', () => {
      const pagination: Pagination = {
        total: 100,
        page: 1,
        limit: 20,
        totalPages: 5,
        next: '/api?page=2',
        previous: null,
        nextCursor: 'cursor-123',
      };
      expect(pagination.total).toBe(100);
      expect(pagination.page).toBe(1);
      expect(pagination.limit).toBe(20);
      expect(pagination.totalPages).toBe(5);
    });
  });

  describe('PaginatedResponse', () => {
    it('should have data array and pagination', () => {
      const response: PaginatedResponse<{ id: string; name: string }> = {
        data: [{ id: '1', name: 'Item 1' }],
        pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
      };
      expect(response.data).toHaveLength(1);
      expect(response.pagination.total).toBe(1);
    });
  });

  describe('PaginationParams', () => {
    it('should have optional pagination fields', () => {
      const params: PaginationParams = {
        page: 1,
        limit: 20,
        cursor: 'cursor-123',
        search: 'test',
      };
      expect(params.page).toBe(1);
      expect(params.limit).toBe(20);
    });
  });

  describe('LoginCredentials', () => {
    it('should have email and password', () => {
      const credentials: LoginCredentials = {
        email: 'test@test.com',
        password: 'teste1234',
      };
      expect(credentials.email).toBe('test@test.com');
      expect(credentials.password).toBe('teste1234');
    });
  });

  describe('RegisterCredentials', () => {
    it('should have all registration fields', () => {
      const credentials: RegisterCredentials = {
        name: 'Test User',
        email: 'test@test.com',
        password: 'teste1234',
        encryptedPassword: 'encrypted-xyz',
      };
      expect(credentials.name).toBe('Test User');
      expect(credentials.email).toBe('test@test.com');
      expect(credentials.password).toBe('teste1234');
      expect(credentials.encryptedPassword).toBe('encrypted-xyz');
    });
  });

  describe('User', () => {
    it('should have all user fields', () => {
      const user: User = {
        id: '1',
        email: 'test@test.com',
        name: 'Test User',
        username: 'testuser',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        planName: 'pro',
        maxChannels: 100,
        maxGroups: 50,
        canCreateSubgroups: true,
        priceMonthly: 999,
        priceYearly: 9999,
        subscriptionStartDate: '2024-01-01',
        subscriptionEndDate: '2025-01-01',
        groupCount: 10,
        channelCount: 25,
        canAddChannel: true,
        canAddGroup: true,
      };
      expect(user.id).toBe('1');
      expect(user.email).toBe('test@test.com');
      expect(user.name).toBe('Test User');
    });
  });

  describe('Group', () => {
    it('should have all group fields', () => {
      const group: Group = {
        id: '1',
        name: 'Test Group',
        description: 'A test group',
        icon: 'folder',
        imageUrl: 'https://example.com/image.jpg',
        category: 'entertainment',
        nestingLevel: 0,
        displayOrder: 1,
        parentId: null,
        enableGroupshelf: true,
        isActive: true,
        createdAt: '2024-01-01',
        channelCount: 10,
        videoCount: 100,
        updatedAt: '2024-01-01',
      };
      expect(group.id).toBe('1');
      expect(group.name).toBe('Test Group');
      expect(group.createdAt).toBe('2024-01-01');
      expect(group.updatedAt).toBe('2024-01-01');
    });
  });

  describe('Channel', () => {
    it('should have all channel fields', () => {
      const channel: Channel = {
        id: '1',
        name: 'Test Channel',
        description: 'A test channel',
        channelId: 'yt-123',
        url: 'https://youtube.com/channel/123',
        thumbnail: 'thumb.jpg',
        imageUrl: 'https://example.com/image.jpg',
        contentType: 'youtube',
        subscriberCount: 1000,
        videoCount: 50,
        groupId: 'g1',
        groupName: 'Test Group',
        groupIcon: 'folder',
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };
      expect(channel.id).toBe('1');
      expect(channel.name).toBe('Test Channel');
      expect(channel.url).toBe('https://youtube.com/channel/123');
      expect(channel.groupId).toBe('g1');
    });
  });

  describe('Anime', () => {
    it('should have all anime fields', () => {
      const anime: Anime = {
        id: '1',
        name: 'One Piece',
        description: 'An anime about pirates',
        userId: 'user-1',
        groupId: 'g1',
        channelId: 'yt-123',
        thumbnail: 'thumb.jpg',
        imageUrl: 'https://example.com/image.jpg',
        createdAt: '2024-01-01',
        contentType: 'youtube',
        updatedAt: '2024-01-01',
        groupName: 'Test Group',
        groupIcon: 'folder',
        url: 'https://youtube.com/watch?v=123',
      };
      expect(anime.id).toBe('1');
      expect(anime.name).toBe('One Piece');
    });
  });

  describe('Website', () => {
    it('should have all website fields', () => {
      const website: Website = {
        id: '1',
        name: 'Test Website',
        url: 'https://example.com',
        thumbnail: 'thumb.jpg',
        groupId: 'g1',
        groupName: 'Test Group',
        displayOrder: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };
      expect(website.id).toBe('1');
      expect(website.name).toBe('Test Website');
      expect(website.url).toBe('https://example.com');
      expect(website.groupId).toBe('g1');
    });
  });

  describe('ShareLink', () => {
    it('should have all share link fields', () => {
      const shareLink: ShareLink = {
        id: '1',
        type: 'group',
        itemId: 'item-1',
        shareUrl: 'https://share.link/abc123',
        groupId: 'g1',
        group_id: 'g1',
        linkCode: 'abc123',
        linkType: 'group',
        permission: 'view',
        createdAt: '2024-01-01',
        expiresAt: '2025-01-01',
      };
      expect(shareLink.id).toBe('1');
      expect(shareLink.type).toBe('group');
      expect(shareLink.shareUrl).toBe('https://share.link/abc123');
    });
  });

  describe('GroupShelf', () => {
    it('should have all group shelf fields', () => {
      const shelf: GroupShelf = {
        id: '1',
        name: 'Test Shelf',
        description: 'A test shelf',
        icon: 'folder',
        userId: 'user-1',
        groupIds: ['g1', 'g2'],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };
      expect(shelf.id).toBe('1');
      expect(shelf.name).toBe('Test Shelf');
      expect(shelf.userId).toBe('user-1');
      expect(shelf.groupIds).toEqual(['g1', 'g2']);
    });
  });

  describe('BlogPost', () => {
    it('should have all blog post fields', () => {
      const post: BlogPost = {
        id: 1,
        status: 'published',
        sort: 1,
        date_created: '2024-01-01',
        date_updated: '2024-01-01',
        image: 'https://example.com/image.jpg',
        slug: 'my-post',
        title: 'My Post',
        description: 'A description',
        excerpt: 'An excerpt',
        readTime: '5 min',
        category: 'tech',
        featured: true,
        content: 'Full content here',
        author: 'John Doe',
        publishedAt: '2024-01-01',
      };
      expect(post.id).toBe(1);
      expect(post.slug).toBe('my-post');
      expect(post.title).toBe('My Post');
      expect(post.content).toBe('Full content here');
    });
  });

  describe('DashboardTotals', () => {
    it('should have all dashboard total fields', () => {
      const totals: DashboardTotals = {
        groups: 10,
        channels: 25,
        youtubeChannels: 15,
        sharedGroups: 3,
        animeChannels: 8,
        websites: 5,
        animes: 100,
      };
      expect(totals.groups).toBe(10);
      expect(totals.channels).toBe(25);
      expect(totals.youtubeChannels).toBe(15);
      expect(totals.sharedGroups).toBe(3);
      expect(totals.animeChannels).toBe(8);
      expect(totals.websites).toBe(5);
      expect(totals.animes).toBe(100);
    });
  });
});
