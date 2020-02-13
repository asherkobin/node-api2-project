const express = require("express");
const server = express();
const postsRouter = require("./routers/posts-router");

server.use(express.json());
server.use(postsRouter);

server.listen(5000, "localhost", () => console.log("Express Running"));