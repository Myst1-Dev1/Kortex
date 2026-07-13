export interface IChat {
  id: string;
  project_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface IMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  message: string;
  edited: boolean;
  deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface IPaginatedMessages {
  messages: IMessage[];
  total: number;
  hasMore: boolean;
}
