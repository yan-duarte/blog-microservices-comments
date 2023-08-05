import express, { Response } from 'express'
import { json } from 'body-parser'
import { randomBytes } from 'crypto'
import { Comments, PostCommentsRequest } from './types'

const app = express()
app.use(json())

const commentsByPostId: Comments = {}

app.get('/posts/:id/comments', (req, res: Response<Comments[0]>) => {
  const { id: postId } = req.params
  res.send(commentsByPostId[postId] ?? [])
})

app.post('/posts/:id/comments', (req: PostCommentsRequest, res: Response<Comments[0]>) => {
  const commentId = randomBytes(4).toString('hex')
  const { content } = req.body
  const { id: postId } = req.params

  const comments = [
    ...commentsByPostId[postId] ?? [],
    { id: commentId, content }
  ]

  commentsByPostId[postId] = comments

  res.status(201).send(comments)
})

app.listen(4001, () => {
  console.log('Listening port 4001')
})