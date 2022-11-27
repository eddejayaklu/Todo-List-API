const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../../src/models/users");
const Task = require("../../src/models/tasks");

const userId = new mongoose.Types.ObjectId();
const user = {
  _id: userId,
  name: "jaya",
  email: "evamsi2000@gmail.com",
  password: "phone123",
  tokens: [
    {
      token: jwt.sign({ _id: userId }, process.env.JWT_SECRET),
    },
  ],
};

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  name: "Vijay",
  email: "evijay@gmail.com",
  password: "phone123",
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
    },
  ],
};

const taskId = new mongoose.Types.ObjectId();
const task = {
  _id: taskId,
  description: "complete refactoring of tasks routes",
  completed: false,
  deadLineDate: "2022-11-10",
  deadLineTime: "10:00",
  owner: userOne._id,
};

const configureDatabase = async () => {
  await User.deleteMany();
  await Task.deleteMany();
  await new User(user).save();
  await new User(userOne).save();
  await new Task(task).save();
};

module.exports = {
  userOne,
  userId,
  user,
  task,
  taskId,
  configureDatabase,
};
