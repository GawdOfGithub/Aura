/* 
Store Interfaces of response types from backend
 */

// naming convention - Server<entity>Response

export interface ServerBaseUserResponse {
  // base user is minimal user data needed.
  id: string;
  name: string;
  profile_photo: string;
}

export interface ServerBasePostResponse {
  id: string;
  video_file: string;
  created_at: string;
  created_by: ServerBaseUserResponse;
}

export interface ServerUserResponse extends ServerBaseUserResponse {
  phone_no: string;
}

export interface GroupMember {
  // needs to be removed
  user_id: string;
  name: string;
  phone_no: string;
  profile_photo: string | null; // Nullable if user hasn't set one
}

export interface VideoChat {
  // needs to be removed
  id: number;
  video_path: string;
  created_by: number; // ID of the creator
  created_at: string; // ISO Date string
  is_viewed: boolean;
}

export interface GroupData {
  // needs to be removed
  group_id: string;
  group_name: string;
  members: GroupMember[];
  video_chats: VideoChat[];
}

export interface ServerRelayResponse {
  id: string;
  end_time: string; // iso datetime
  users_participated: string[];
  first_post: ServerBasePostResponse;
  number_posts: number;
}

export interface ServerChatResponse {
  id: string;
  name: string;
  invite_code: string;
  members: ServerBaseUserResponse[];
  relays: ServerRelayResponse[] | null;
  created_by: ServerBaseUserResponse;
}

export interface UploadSignedData {
  url: string;
  key: string;
  headers: Record<string, string>;
  chat_id: string;
}

export interface CreatePostResponse {
  post_id: string;
  relay_id: string;
  relay_end_time: string;
}
