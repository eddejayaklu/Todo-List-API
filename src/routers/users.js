const express = require("express");
const User = require("../models/users");
const router = new express.Router();
const auth = require("../middleware/auth");

router.post("/users", auth, async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/users/me", async (req, res) => {
  res.send(req.user);
});

router.patch("/users/me", async (req, res) => {
  const Updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "age", "password"];
  const isValidOperation = Updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid Updates!" });
  }
  try {
    Updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();

    res.status(200).send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/users/me", async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.send(400).send(e);
  }
});

module.exports = router;
