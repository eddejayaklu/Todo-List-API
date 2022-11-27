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
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
  await task.populate("owner").execPopulate();
  remainderEmail(
    task.owner.email,
    task.description,
    task.owner.name,
    task.deadLineDate
  );
});

//   /tasks?completed=true
//   /tasks?limit=10&skip=20
//   /tasks?sortByCreation=createdAt:desc
//   /tasks?sortByDate=deadLineDate:desc
router.get("/tasks", auth, async (req, res) => {
  const match = {};
  const sort = {};

  if (req.query.completed) {
    match.completed = req.query.completed === "true";
    console.log(match.completed);
  }

  if (req.query.sortByCreation) {
    const parts = req.query.sortByCreation.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }

  if (req.query.sortByDate) {
    const parts = req.query.sortByDate.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }
  try {
    await req.user
      .populate({
        path: "tasks",
        //only matched objects will be returned
        match,
        options: {
          limit: parseInt(req.query.limit), //limit the number of objects in single page
          skip: parseInt(req.query.skip), // skip the pages, skip will start from index 0
          sort: sort,
        },
      })
      .execPopulate();
    res.send(req.user.tasks);
  } catch (e) {
    res.status(500).send();
  }
});

// @desc GET tasks by ID
// @access Private
router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send();
    }
    res.status(200).send(task);
  } catch (e) {
    res.status(500).send();
  }
});

// @desc update tasks
// @access Private
router.patch("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "description",
    "completed",
    "deadLineDate",
    "deadLineTime",
  ];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates" });
  }
  try {
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send();
    }
    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();
    res.status(200).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

// @desc Delete tasks by ID
// @access Private
router.delete("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOneAndDelete({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send();
    }
    res.status(200).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
