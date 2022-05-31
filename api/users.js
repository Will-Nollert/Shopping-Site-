const express = require("express");
const usersRouter = express.Router();
const { User } = require("../db/models");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const authorizeUser = require("./auth");

module.exports = usersRouter;

usersRouter.get("/", async (req, res, next) => {
  try {
    const users = await User.getAllUsers();
    res.send({
      users,
    });
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/register", async (req, res, next) => {
  try {
    const { username, password, email } = req.body;

    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters!");
    }

    const user = await User.createUser({
      username,
      password,
      email,
    });

    res.status(201).send({ user });
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.getUser({ username, password });

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET
    );

    res.status(200).send({ token });
  } catch (error) {
    next(error);
  }
});

usersRouter.patch("/:id", async (req, res, next) => {
  try {
    const { username, first_name, email } = req.body;
    const updateFields = { username, first_name, email };
    const user = await User.updateUser(req.params.id, updateFields);
    res.status(204).send(user);
  } catch (err) {
    next(err);
  }
});

usersRouter.get("/me", authorizeUser, async (req, res, next) => {
  try {
    const user = await User.getUserById(req.user.id);
    res.send(user);
  } catch (error) {
    next(error);
  }
});
