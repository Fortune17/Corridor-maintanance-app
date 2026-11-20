export type UserRole = 'student' | 'staff' | 'admin';

export type RequestCategory =
  | 'Plumbing and water leaks'
  | 'Electricity and lighting'
  | 'Doors, locks and security'
  | 'Furniture and fixtures'
  | 'Internet and connectivity'
  | 'Cleaning and sanitation'
  | 'Windows and structural damage'
  | 'Appliances'
  | 'Other';

export type RequestPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

export type RequestStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Awaiting Parts'
  | 'Resolved'
  | 'Closed';

export type BuildingBlock =
  | 'Block A (Oak Hall)'
  | 'Block B (Pine Hall)'
  | 'Block C (Maple Hall)'
  | 'Block D (Cedar Hall)'
  | 'Block E (Willow Annex)'
  | 'Block F (Birch Hall)'
  | 'Communal Facilities';

export const BUILDING_BLOCKS: BuildingBlock[] = [
  'Block A (Oak Hall)',
  'Block B (Pine Hall)',
  'Block C (Maple Hall)',
  'Block D (Cedar Hall)',
  'Block E (Willow Annex)',
  'Block F (Birch Hall)',
  'Communal Facilities',
];

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  student_number?: string;
  phone_number?: string;
  room_number?: string;
  building?: BuildingBlock;
  avatar_url?: string;
  bio?: string;
  course?: string;
  interests?: string[];
  password?: string; // Account password saved in database
  created_at: string;
}

export interface MaintenanceRequest {
  id: string;
  reference_number: string;
  student_id: string;
  title: string;
  description: string;
  category: RequestCategory;
  building: BuildingBlock;
  room_number: string;
  priority: RequestPriority;
  status: RequestStatus;
  assigned_to?: string; // staff user id
  assigned_to_name?: string;
  preferred_access_time?: string;
  delay_reason?: string;
  work_performed?: string;
  estimated_completion?: string;
  resolved_at?: string;
  closed_at?: string;
  student_confirmed_resolved: boolean;
  reopen_count: number;
  created_at: string;
  updated_at: string;
}

export type CommentVisibility = 'student_visible' | 'staff_only';

export interface RequestComment {
  id: string;
  request_id: string;
  author_id: string;
  author_name?: string;
  author_role?: UserRole;
  comment: string;
  visibility: CommentVisibility;
  created_at: string;
}

export interface RequestAttachment {
  id: string;
  request_id: string;
  uploaded_by: string;
  uploaded_by_name?: string;
  storage_path: string; // Data URL or public storage URL
  file_name: string;
  file_type: string;
  file_size?: number;
  is_completion_proof?: boolean;
  created_at: string;
}

export interface RequestHistory {
  id: string;
  request_id: string;
  actor_id: string;
  actor_name?: string;
  actor_role?: UserRole;
  action: string;
  previous_value?: string;
  new_value?: string;
  notes?: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  request_id: string;
  title: string;
  message: string;
  read_at: string | null;
  created_at: string;
}

// --- COMMUNITY FORUM, FOLLOWING & ANNOUNCEMENTS ---

export type PostVisibility = 'everyone' | 'friends' | 'announcement';

export type PostCategory =
  | 'General'
  | 'Study & Academics'
  | 'Events & Social'
  | 'Marketplace'
  | 'Lost & Found'
  | 'Residence Notice'
  | 'Maintenance Advisory';

export interface ForumPost {
  id: string;
  author_id: string;
  author_name?: string;
  author_role?: UserRole;
  author_building?: BuildingBlock;
  author_room?: string;
  title?: string;
  content: string;
  category: PostCategory;
  visibility: PostVisibility;
  is_pinned?: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ForumComment {
  id: string;
  post_id: string;
  author_id: string;
  author_name?: string;
  author_role?: UserRole;
  content: string;
  created_at: string;
}

export interface UserFollow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface ForumPostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}
