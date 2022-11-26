const express = require("express");
require("./db/mongoose");
const userRouter = require("./routers/users");
const taskRouter = require("./routers/tasks");

const path = require("path");
const app = express();

const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicDirectoryPath));
app.use(express.json());
//Mount routers
app.use(userRouter);
app.use(taskRouter);

module.exports = app;
