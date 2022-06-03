const { server, handle } = require("../index");
const { client } = require("../db");
const supertest = require("supertest");
const request = supertest(server);
const { Product } = require("../db");
const { Inventory } = require("../db");
const { getAllProducts } = require("../db/models/products");

describe("/api/products endpoint", () => {
  let createdProduct;

  afterAll(async () => {
    const message = await Product.destroyProduct(createdProduct.id);
    await Product.destroyProduct(createdProduct.id);
    await Inventory.destroyInventory(createdProduct.inventory_id);
    await client.end();
    handle.close();
  });

  test("GET /products should returns all products", async () => {
    const response = await request.get("/api/products");
    expect(response.status).toBe(200);
    const products = response.body.products;
    expect(products.length).toBeTruthy();
  });

  test("POST /products should add a new product to the DB", async () => {
    const newProduct = {
      name: "New Product",
      price: "666",
      description: "Test Test Test",
      product_img: "www.google.com",
      created_at: new Date().toISOString(),
      quantity: "100",
    };
    const response = await request.post("/api/products").send(newProduct);

    expect(response.status).toBe(200);
    const product = response.body;
    createdProduct = product;

    expect(product).toBeTruthy();
    expect(product.name).toEqual(newProduct.name);
  });

  test("GET /:productId should return a product with specefic Id", async () => {
    const response = await request.get(`/api/products/${createdProduct.id}`);
    expect(response.status).toBe(200);
    const fetchedProduct = response.body;
    expect(fetchedProduct).toBeTruthy();
  });

  test("PATCH /:productId/inventory/:inventoryId should update a particular products inventory by it's inventoryId", async () => {
    const createdProductId = createdProduct.id;
    const createdProductInventoryId = createdProduct.inventory_id;

    const editedProduct = await Product.updateProduct(createdProductId, {
      inventory_id: createdProductInventoryId,
      quantity: "99",
    });

    const response = await request
      .patch(`/api/${createdProductId}/inventory/${createdProductInventoryId}`)
      .send(editedProduct);
    expect(response.status).toBe(200);
    expect(editedProduct).toBeTruthy();
    expect(editedProduct.inventory.quantity).toEqual(99);
  });
});
