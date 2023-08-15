import express, { Response } from "express";
import { json } from "body-parser";
import { randomBytes } from "crypto";
import { Comments, PostCommentsRequest } from "./types";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(json());
app.use(cors());

const commentsByPostId: Comments = {};

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

    const comments = [
      ...(commentsByPostId[postId] ?? []),
      { id: commentId, content },
    ];

    commentsByPostId[postId] = comments;

    await axios.post("http://localhost:4005/events", {
      type: "CommentCreated",
      data: {
        id: commentId,
        content,
        postId,
      },
    });

    res.status(201).send(comments);
  }
);

app.post("/events", async (req, res) => {
  const { type, data } = req.body;
  console.log("Received Event", { type, data });

  res.send({});
});

app.listen(4001, () => {
  console.log("Listening port 4001");
});
