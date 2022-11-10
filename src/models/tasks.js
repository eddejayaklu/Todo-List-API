const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    deadLineDate: {
      type: String, //dd/mm/yyyy
      required: true,
    },
    deadLineTime: {
      type: String, //hh:mm
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// delete owner object
taskSchema.methods.toJSON = function () {
  const task = this;
  const taskObject = task.toObject();
  delete taskObject.owner;
  return taskObject;
};

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
