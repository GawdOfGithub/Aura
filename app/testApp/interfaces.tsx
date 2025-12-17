export interface GroupMember {
  user_id: string;
  name: string;
  phone_no: string;
  profile_photo: string | null; // Nullable if user hasn't set one
}

export interface VideoChat {
  id: number;
  video_path: string;
  created_by: number; // ID of the creator
  created_at: string; // ISO Date string
  is_viewed: boolean;
}

export interface GroupData {
  group_id: string;
  group_name: string;
  members: GroupMember[];
  video_chats: VideoChat[];
}
