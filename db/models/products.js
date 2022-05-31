// grab our db client connection to use with our adapters
const client = require("../client");
const { createInventory, updateInventory } = require("./inventory");

module.exports = {
  // add your database adapter fns here
  createProduct,
  getAllProducts,
};

async function createProduct({
  name,
  price,
  description,
  product_img,
  created_at,
  quantity,
}) {
  try {
    const inventoryRecord = await createInventory({ quantity });

    const {
      rows: [product],
    } = await client.query(
      `
         INSERT INTO products (name, price, description, product_img, created_at, inventory_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *;
     `,
      [name, price, description, product_img, created_at, inventoryRecord.id]
    );

    return product;
  } catch (error) {
    throw error;
  }
}

async function getAllProducts() {
  try {
    const { rows: product } = await client.query(`
      SELECT * FROM product;
      `);

    return product;
  } catch (error) {
    next(error);
  }
}
