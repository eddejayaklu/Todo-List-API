const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/users");
const { user, userId, configureDatabase } = require("./fixtures/db");

//before every test exceutes,beforeEach will be exceuted first then test case will be exceuted
beforeEach(configureDatabase);

//postive test case for sign up user
test("Sign up a new User", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "jayavardhan",
      email: "evamsi2004@gmail.com",
      password: "phone123",
    })
    .expect(201);

  //Get the user by Id
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  //check if userobject stored in the database correctly or not
  expect(response.body).toMatchObject({
    user: {
      name: "jayavardhan",
      email: "evamsi2004@gmail.com",
    },
    token: user.tokens[0].token,
  });
});

//postive test case for login user
test("Login a user", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({
      email: user.email,
      password: user.password,
    })
    .expect(200);

  const user1 = await User.findById(userId);
  expect(response.body.token).toBe(user1.tokens[1].token);
});

//negative test case for login user
test("user should not login with bad credentials", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: "vamsik89089@gmail.com", //wrong email
      password: user.password,
    })
    .expect(400);
});

//postive test case for get user profile
test("get user profile", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${user.tokens[0].token}`)
    .send()
    .expect(200);
});

//negative test case for get user profile, when user is not authenticated
test("user should not get for unauthenticated user", async () => {
  await request(app).get("/users/me").send().expect(401);
});

//postive test case for delete user
test("delete user account", async () => {
  await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${user.tokens[0].token}`)
    .send()
    .expect(200);

  const user1 = await User.findById(userId);
  expect(user1).toBeNull();
});

//negative test case, user should not be deleted if user is not authenticated
test("delete user account", async () => {
  await request(app).delete("/users/me").send().expect(401);
});
