const mongoose = require("mongoose");
const validator = require("validator");
const bycrpt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./tasks");
const crypto = require("crypto");

// User model
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is not Valid");
        }
      },
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error("Age must be a postive number");
        }
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 7,
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error('password cannot contain "password" ');
        }
      },
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    profile: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  }
);

// virtual relation between tasks collection and user collection
userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner",
});

// delete password and token in response
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;

  return userObject;
};

// Sign JWT and return
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("unable to login");
  }

  const isMatch = await bycrpt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Unable to login");
  }

  return user;
};

// hash the password before save
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bycrpt.hash(user.password, 8);
  }
  next();
});

// generate and hash password reset token
userSchema.methods.generatePasswordReset = async function () {
  const user = this;
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  //set expire token
  this.resetPasswordExpire = Date.now() + 20 * 60 * 1000;
  await user.save();
  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
