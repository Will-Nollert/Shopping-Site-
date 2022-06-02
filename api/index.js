const apiRouter = require("express").Router();

apiRouter.get("/", (req, res, next) => {
  res.send({
    message: "Base API layer is Up!",
  });
});

apiRouter.get("/health", (req, res, next) => {
  res.send({
    healthy: true,
  });
});

//USERS ROUTER
const usersRouter = require("./users");
apiRouter.use("/users", usersRouter);

//PRODUCTS ROUTER
const productsRouter = require("./products");
apiRouter.use("/products", productsRouter);

module.exports = apiRouter;
