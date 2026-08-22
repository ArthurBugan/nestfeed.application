export interface User {
  id: string;
  email: string;
  name?: string;
  username?: string;
  createdAt?: string;
  updatedAt?: string;
  planName?: string;
  maxChannels?: number;
  maxGroups?: number;
  canCreateSubgroups?: boolean;
  priceMonthly?: number;
  priceYearly?: number;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  groupCount?: number;
  channelCount?: number;
  canAddChannel?: boolean;
  canAddGroup?: boolean;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  channels?: Channel[];
  category?: string;
  nestingLevel?: number;
  displayOrder?: number;
  parentId?: string | null;
  enableGroupshelf?: boolean;
  isActive?: boolean;
  createdAt: string;
  channelCount?: number;
  videoCount?: number;
  updatedAt: string;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  channelId?: string;
  url: string;
  thumbnail?: string;
  imageUrl?: string;
  contentType?: string;
  subscriberCount?: number;
  videoCount?: number;
  groupId: string;
  groupName?: string;
  groupIcon?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Anime {
  id: string;
  name: string;
  description?: string;
  userId?: string | null;
  groupId?: string | null;
  channelId?: string;
  thumbnail?: string;
  imageUrl?: string;
  createdAt?: string;
  contentType?: string;
  updatedAt?: string;
  groupName?: string;
  groupIcon?: string;
  url?: string;
}

export interface Website {
  id: string;
  name: string;
  url: string;
  thumbnail?: string;
  groupId: string;
  groupName?: string;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShareLink {
  id: string;
  type?: 'group' | 'channel' | 'anime';
  itemId?: string;
  shareUrl?: string;
  groupId?: string;
  group_id?: string;
  linkCode?: string;
  linkType?: string;
  permission?: string;
  createdAt?: string;
  expiresAt?: string;
}

export interface GroupShelf {
  id: string;
  name?: string;
  description?: string;
  icon?: string;
  userId: string;
  groupIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogPost {
  id: number;
  status?: string;
  sort?: number | null;
  date_created?: string;
  date_updated?: string;
  image?: string;
  slug: string;
  title: string;
  description?: string;
  excerpt?: string;
  readTime?: string;
  category?: string;
  featured?: boolean;
  content: string;
  author?: string;
  publishedAt?: string;
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  channelId: string;
  channelName?: string;
  publishedAt: string;
  duration?: string;
  viewCount?: number;
  likeCount?: number;
}

export interface DashboardTotals {
  groups: number;
  channels: number;
  youtubeChannels?: number;
  sharedGroups?: number;
  animeChannels?: number;
  websites?: number;
  animes?: number;
}

export interface PaymentRequest {
  priceId: string;
  interval: 'monthly' | 'yearly';
}

export interface CheckoutResponse {
  url: string;
}

export interface IAPReceiptVerificationRequest {
  platform: 'ios' | 'android';
  product_id: string;
  receipt: string;
  transaction_id: string;
}

export interface IAPReceiptVerificationResponse {
  success: boolean;
  plan_name: string;
}

export const IAP_PRODUCT_IDS: Record<string, string> = {
  Basic: 'Basic',
  basic: 'basic',
  Pro: 'Pro',
  pro: 'pro',
};

export const PLAN_BY_IAP_PRODUCT: Record<string, string> = {
  Basic: 'Basic',
  basic: 'basic',
  Pro: 'Pro',
  pro: 'pro',
};