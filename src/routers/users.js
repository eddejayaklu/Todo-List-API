const express = require("express");
const User = require("../models/users");
const multer = require("multer");
const router = new express.Router();
const auth = require("../middleware/auth");
const { sendWelcomeEmail, sendCancelationEmail } = require("../emails/account");
const { forgotPassword, resetPassword } = require("./auth.js/forgotPassword");

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
router.post("/users/login", async (req, res) => {
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

// @desc logout from current device
// @access Private
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.user.save();
    res.send("logout success");
  } catch (e) {
    res.status(500).send();
  }
});

// @desc logout from all devices
// @access Private
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send("logout out");
  } catch (error) {
    res.send(500).send();
  }
});

// @desc multer instance
const upload = multer({
  //max 3MB file size
  limits: {
    fileSize: 30000000,
  },
  // callback function with error will be called when extension does not match
  // if everthing goes right callback with arg undefined will be called
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

// @desc update profile Image
// @access private
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

// @desc delete profile Image
// @access private
router.delete("/users/me/profile", auth, async (req, res) => {
  req.user.profile = undefined;
  await req.user.save();
  res.send();
});

// @desc get profile Image
// @access private
router.get("/users/:id/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.profile) {
      throw new Error();
    }
    res.set("Content-Type", "image/jpg");
    res.send(user.profile);
  } catch (error) {
    res.status(400).send();
  }
});

// @desc forgot password link will be sent to user email
// @access public
router.post("/users/forgotpassword", forgotPassword);

// @desc update the new password with resetUrl
// @access public
router.post("/users/resetpassword/:resetToken", resetPassword);

module.exports = router;
