const request = require("supertest");
const Task = require("../src/models/tasks");
const {
  user,
  userId,
  task,
  taskId,
  userOne,
  configureDatabase,
} = require("./fixtures/db");
const app = require("../src/app");

beforeEach(configureDatabase);

test("Create task for user", async () => {
  const response = await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${user.tokens[0].token}`)
    .send({
      description: "complete refactoring of tasks routes",
      completed: false,
      deadLineDate: "2022-11-10",
      deadLineTime: "10:00",
    })
    .expect(201);
  const task = await Task.findById(response.body._id);
  expect(task).not.toBeNull();
  expect(task.description).toEqual("complete refactoring of tasks routes");
});

test("Fetch user tasks", async () => {
  const response = await request(app)
    .get("/tasks")
    .set("Authorization", `Bearer ${user.tokens[0].token}`)
    .send()
    .expect(200);
});

test("Get tasks by Id", async () => {
  const response = await request(app)
    .get(`/tasks/${taskId}`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});
