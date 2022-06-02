const express = require("express");
const productsRouter = express.Router();
const { Product } = require("../db/models");

module.exports = productsRouter;

productsRouter.get("/", async (req, res, next) => {
  try {
    const products = await Product.getAllProducts();
    res.send({ products });
  } catch (error) {
    next(error);
  }
});

productsRouter.post("/", async (req, res, next) => {
  try {
    const { name, price, description, product_img, created_at, quantity } =
      req.body;
    const product = await Product.createProduct({
      name,
      price,
      description,
      product_img,
      created_at,
      quantity,
    });
    res.send(product);
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/:productId", async (req, res, next) => {
  try {
    const product = await Product.getProductById(req.params.productId);
    res.send(product);
  } catch (error) {
    next(error);
  }
});

productsRouter.delete("/:productId", async (req, res, next) => {
  try {
    const destroyedProduct = await Product.destroyProduct(req.params.productId);
    res.send(destroyedProduct);
  } catch (error) {
    next(error);
  }
});

productsRouter.patch(
  "/:productId/inventory/:inventoryId",
  async (req, res, next) => {
    try {
      const { sockId, inventoryId } = req.params;
      const { quantity } = req.body;

      const updatedSock = await Sock.updateSock(sockId, {
        inventory_id: inventoryId,
        quantity,
      });

      console.log({ updatedSock });

      res.status(204).send(updatedSock);
    } catch (err) {
      next(err);
    }
  }
);
