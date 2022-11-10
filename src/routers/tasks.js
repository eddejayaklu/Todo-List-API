const express = require("express");
const Task = require("../models/tasks");
const router = new express.Router();
const auth = require("../middleware/auth");
const { remainderEmail } = require("../emails/account");

// @desc Create tasks
// @access Private
router.post("/tasks", auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await task.save();
    await task.populate("owner").execPopulate();
    console.log(
      task.owner.email,
      task.description,
      task.owner.name,
      task.deadLineDate
    );
    remainderEmail(
      task.owner.email,
      task.description,
      task.owner.name,
      task.deadLineDate
    );
    //task = task.toObject()
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

//   /tasks?completed=true
//   /tasks?limit=10&skip=20
//   /tasks?sortBy=createdAt:desc

router.get("/tasks", auth, async (req, res) => {
  const match = {};
  const sort = {};

  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }
  try {
    await req.user
      .populate({
        path: "tasks",
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort,
        },
      })
      .execPopulate();
    res.send(req.user.tasks);
  } catch (e) {
    res.status(500).send();
  }
});
