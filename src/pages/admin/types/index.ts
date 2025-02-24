export interface AdminAppointment {
  id: string;
  date_time: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  user_id: string;
  profiles: {
    full_name: string;
    email: string;
  } | null;
}

export interface AdminChat {
  user_id: string;
  profiles: {
    full_name: string;
    email: string;
  } | null;
  last_message: {
    content: string;
    created_at: string;
    is_admin: boolean;
  };
  unread_count: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  created_at: string;
  is_admin: boolean;
  user_id: string;
  admin_id?: string;
  profiles: {
    full_name: string;
    email: string;
  } | null;
  admin?: {
    full_name: string;
  } | null;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: string;
  author_id: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  } | null;
}

export interface GroupMember {
  id: string;
  joined_at: string;
  profiles: {
    full_name: string;
    email: string;
  } | null;
}

export interface SupportGroup {
  id: string;
  name: string;
  description: string;
  capacity: number;
  current_members: number;
  created_at: string;
  members?: GroupMember[];
  sessions?: string[];
  indicators?: string[];
  resources?: string[];
}