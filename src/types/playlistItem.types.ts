export interface PlaylistItem {
  id: string;
  playlist_id: string;
  item_type: string;
  content: string;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  video_url?: string;
  order?: number;
} 