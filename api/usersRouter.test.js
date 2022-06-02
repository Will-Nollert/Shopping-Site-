const { server, handle } = require("../index");
const { client } = require("../db");
const { User } = require("../db");
const supertest = require("supertest");
const request = supertest(server);

describe("/api/users endpoint", () => {
  let createdUser;

  // close db connection and supertest server tcp connection
  afterAll(async () => {
    const message = await User.hardDeleteUser(createdUser.id);
    /* also delete the postUser that was stored in the parent scope */
    await User.hardDeleteUser(createdUser.id);
    await client.end();
    handle.close();
  });

  test("GET /users returns all users", async () => {
    const response = await request.get("/api/users");
    expect(response.status).toBe(200);
    const user = response.body.users[response.body.users.length - 1];
    expect(user).toBeTruthy();
  });

  //test register a new user
  test("POST /users registers a new user and returns user obj", async () => {
    const registeredUser = {
      username: "newRegisteredUser",
      password: "123456789",
      email: "newUser@test.mail",
    };
    const response = await request
      .post("/api/users/register")
      .send(registeredUser);
    expect(response.status).toBe(201);
    const { user } = response.body;

    createdUser = user;

    expect(user).toBeTruthy();
    expect(user.username).toEqual(registeredUser.username);
  });

  //test login the newly registered user
  test("POST /login should login new user and return token", async () => {
    const response = await request
      .post("/api/users/login")
      .send({ username: createdUser.username, password: "123456789" });
    expect(response.status).toBe(200);
    const token = response.body.token;
    expect(token).toBeTruthy();
  });

  //test edit the username of the new user
  test("PATCH /users/userID should edit username and check if match ", async () => {
    const createdUserId = createdUser.id;
    const editedUser = {
      username: "EDITED",
      password: "123456789",
    };
    const response = await request
      .patch(`/api/users/${createdUserId}`)
      .send(editedUser);
    expect(response.status).toBe(204);

    const allUsers = await User.getAllUsers();
    const editedCreatedUser = allUsers.pop();

    expect(editedCreatedUser).toBeTruthy();
    expect(editedCreatedUser.username).toEqual("EDITED");
  });

  //test getting user object for that new user
  test("GET /users/me should check for token and return meta user obj", async () => {
    const toeknFetch = await request
      .post("/api/users/login")
      .send({ username: "albert", password: "bertie99" });
    const token = toeknFetch.body.token;

    const response = await request
      .get("/api/users/me")
      .auth(token, { type: "bearer" });
    expect(response.status).toBe(200);
    expect(response.body.orders).toBeTruthy();
  });
});
