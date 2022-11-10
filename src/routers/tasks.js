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
