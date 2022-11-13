const express = require("express");
const User = require("../models/users");
const multer = require("multer");
const router = new express.Router();
const auth = require("../middleware/auth");
const { sendWelcomeEmail, sendCancelationEmail } = require("../emails/account");

// @desc Create a new User(SignUp)
// @access Public
router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

// @desc Login User
// @access Public
router.post("/users/login", auth, async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

// @desc Get User
// @access Private
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

// @desc Update user details
// @access Private
router.patch("/users/me", auth, async (req, res) => {
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

// @desc Delete User
// @access Private
router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    sendCancelationEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (e) {
    res.send(400).send(e);
  }
});

// @desc multer instance
const upload = multer({
  dest: "Profiles",
  limits: {
    fileSize: 10000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload jpg or jpeg or png"));
    }
    cb(undefined, true);
  },
});

// @desc   create a profile image
// @access Private
router.post(
  "/users/me/profile",
  auth,
  upload.single("profile"),
  async (req, res) => {
    req.user.profile = req.file.buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

module.exports = router;
