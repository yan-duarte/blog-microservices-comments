import express, { Response } from "express";
import { json } from "body-parser";
import { randomBytes } from "crypto";
import {
  Comments,
  Event,
  EventCommentModerated,
  PostCommentsRequest,
} from "./types";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(json());
app.use(cors());

const commentsByPostId: Comments = {};

const handleEvent = async ({ type, data }: Event) => {
  switch (type) {
    case "CommentModerated": {
      const {
        postId,
        id: commentId,
        ...eventComment
      } = data as EventCommentModerated;

      const localComment = commentsByPostId[postId].find(
        (comment) => comment.id === commentId
      );

      if (localComment) {
        localComment.status = eventComment.status;
      }

      await axios.post("http://localhost:4005/events", {
        type: "CommentUpdated",
        data: {
          id: commentId,
          postId,
          ...localComment,
        },
      });

      break;
    }
  }
};

app.get("/posts/:id/comments", (req, res: Response<Comments[0]>) => {
  const { id: postId } = req.params;
  res.send(commentsByPostId[postId] ?? []);
});

app.post(
  "/posts/:id/comments",
  async (req: PostCommentsRequest, res: Response<Comments[0]>) => {
    const commentId = randomBytes(4).toString("hex");
    const { content } = req.body;
    const { id: postId } = req.params;

    const comments: Comments[0] = [
      ...(commentsByPostId[postId] ?? []),
      { id: commentId, content, status: "pending" },
    ];

    commentsByPostId[postId] = comments;

    await axios.post("http://localhost:4005/events", {
      type: "CommentCreated",
      data: {
        id: commentId,
        content,
        postId,
        status: "pending",
      },
    });

    res.status(201).send(comments);
  }
);

app.post("/events", async (req, res) => {
  const { type, data } = req.body;
  console.log("Received Event", { type, data });

  await handleEvent({ type, data });

  res.send({});
});

app.listen(4001, async () => {
  console.log("Listening port 4001");

  const { data: events } = await axios.get<Event[]>(
    "http://localhost:4005/events"
  );

  await Promise.all(
    events.map(async (event) => {
      console.log("Processing event: ", event.type);
      await handleEvent(event);
    })
  );
});
