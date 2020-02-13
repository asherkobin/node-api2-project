const express = require("express");
const postsRouter = express.Router();
const DB = require("../data/db");

postsRouter.post("/api/posts", (req, res) => {
  if (!req.body.title || !req.body.contents) {
    res.status(400).json({ errorMessage: "Please provide title and contents for the post." });
  }
  else {
    DB
    .insert(req.body)
    .then (({id}) => {
      DB
      .findById(id)
      .then (newlyCreatedPost => {
        res.status(201).json(newlyCreatedPost);
      });
    })
    .catch (() => {
      res.status(500).json({ error: "There was an error while saving the post to the database" });
    });
  }
});

postsRouter.post("/api/posts/:id/comments", (req, res) => {
  const postId = req.params.id;
  const commentBody = req.body;

  DB
  .findById(postId)
  .then (existingPost => {
    if (!existingPost) {
      res.status(404).json({ message: "The post with the specified ID does not exist." });
    }
    else if (!commentBody.text) {
      res.status(400).json({ errorMessage: "Please provide text for the comment." });
    }
    else {
      DB
      .insertComment({ ...commentBody, post_id: postId })
      .then(({id}) => {
        DB
        .findCommentById(id)
        .then(newlyCreatedComment => {
          res.status(201).json(newlyCreatedComment);
        });
      })
      .catch(() => {
        res.status(500).json({ error: "There was an error while saving the comment to the database" });
      });
    }
  });
});

postsRouter.get("/api/posts", (req, res) => {
  DB
  .find()
  .then(allPosts => {
    res.status(200).json(allPosts);
  })
  .catch(() => {
    res.status(500).json({ error: "The posts information could not be retrieved." });
  });
});

postsRouter.get("/api/posts/:id", (req, res) => {
  const postId = req.params.id;
  
  DB
  .findById(postId)
  .then(returndPosts => {
    if (returndPosts.length !== 1) {
      res.status(404).json({ message: "The post with the specified ID does not exist." });
    }
    else {
      res.status(200).json(returndPosts[0]);
    }
  })
  .catch(() => {
    res.status(500).json({ error: "The posts information could not be retrieved." });
  });
});

postsRouter.get("/api/posts/:id/comments", (req, res) => {
  const postId = req.params.id;
  
  DB
  .findById(postId)
  .then(returndPosts => {
    if (returndPosts.length !== 1) {
      res.status(404).json({ message: "The post with the specified ID does not exist." });
    }
    else {
      DB
      .findPostComments(postId)
      .then(returndComments => {
        res.status(200).json(returndComments);
      })
      .catch(() => {
        res.status(500).json({ error: "The comments information could not be retrieved." });
      });
    }
  });
});

postsRouter.delete("/api/posts/:id", (req, res) => {
  const postId = req.params.id;
  
  DB
  .findById(postId)
  .then(returndPosts => {
    if (returndPosts.length !== 1) {
      res.status(404).json({ message: "The post with the specified ID does not exist." });
    }
    else {
      DB
      .remove(postId)
      .then(() => {
        res.status(200).end();
      })
      .catch(() => {
        res.status(500).json({ error: "The post could not be removed" });
      });
    }
  });
});

postsRouter.put("/api/posts/:id", (req, res) => {
  const postId = req.params.id;
  const postBody = req.body;
  
  DB
  .findById(postId)
  .then(returnedPosts=> {
    if (returnedPosts.length !== 1) {
      res.status(404).json({ message: "The post with the specified ID does not exist." });
    }
    else if (!postBody.title || !postBody.contents) {
      res.status(400).json({ errorMessage: "Please provide title and contents for the post." });
    }
    else {
      DB
      .update(postId, { ...postBody, id: postId })
      .then(() => {
        DB
        .findById(postId)
        .then(updatedPost => {
          res.status(200).json(updatedPost);
        });
      })
      .catch(() => {
        res.status(500).json({ error: "The post information could not be modified." });
      });
    }
  })
  .catch(() => {
    res.status(500).json({ error: "The post information could not be retrieved." });
  });
});

module.exports = postsRouter;