// grab our db client connection to use with our adapters
const client = require("../client");

module.exports = {
  // add your database adapter fns here
  createProduct,
  getAllSocks,
};

async function createProduct({ name, price, description, product_img }) {
  try {
    const {
      rows: [product],
    } = await client.query(
      `
         INSERT INTO products (name, price, description, product_img)
         VALUES ($1, $2, $3, $4)
         RETURNING *;
     `,
      [name, price, description, product_img]
    );

    return product;
  } catch (error) {
    throw err;
  }
}

async function getAllSocks() {
  try {
    const { rows: product } = await client.query(`
      SELECT * FROM product;
      `);

    return product;
  } catch (error) {
    next(error);
  }
}
