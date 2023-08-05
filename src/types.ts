import { Request } from "express"

export interface Comments {
  [postId: string]: {
    id: string
    content: string
  }[]
}

export interface PostCommentsRequest extends Request {
  body: {
    content: string
  }
  params: {
    id: string
  }
}