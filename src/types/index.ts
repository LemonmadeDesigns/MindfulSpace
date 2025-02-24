// User Types
export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'professional' | 'admin';
  createdAt: Date;
  profile?: UserProfile;
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  notifications: boolean;
  privateProfile: boolean;
  theme: 'light' | 'dark';
}

// Resource Types
export interface Resource {
  _id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  content: string;
  author: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type ResourceCategory = 
  | 'anxiety'
  | 'depression'
  | 'stress'
  | 'mindfulness'
  | 'self-care'
  | 'professional-help';

// Forum Types
export interface ForumPost {
  _id: string;
  title: string;
  content: string;
  author: User;
  category: ForumCategory;
  tags: string[];
  replies: ForumReply[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ForumReply {
  _id: string;
  content: string;
  author: User;
  createdAt: Date;
  updatedAt: Date;
}

export type ForumCategory = 
  | 'support'
  | 'discussion'
  | 'success-stories'
  | 'questions'
  | 'resources';