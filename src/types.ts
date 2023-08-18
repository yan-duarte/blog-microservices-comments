import { Request } from "express"

export interface Event {
  type: string;
  data: Record<string, unknown>;
}

export interface Comments {
  [postId: string]: {
    id: string
    content: string
    status: 'pending' | 'approved' | 'rejected'
  }[]
}

export type EventCommentModerated = {
  id: string;
  postId: string;
  content: string;
  status: "pending" | "approved" | "rejected";
};

export interface PostCommentsRequest extends Request {
  body: {
    content: string
  }
  params: {
    id: string
  }
}