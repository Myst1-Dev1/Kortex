export interface INotification {
  id: string;
  user_id: string;
  project_id: string | null;
  type: string;
  title: string;
  description: string;
  metadata: Record<string, unknown>;
  read: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface IPaginatedNotifications {
  notifications: INotification[];
  total: number;
  hasMore: boolean;
}
