// grab our db client connection to use with our adapters
const client = require("../client");
const { createInventory, updateInventory } = require("./inventory");

module.exports = {
  // add your database adapter fns here
  createProduct,
  getAllProducts,
  destroyProduct,
  getProductById,
  updateProduct,
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
      SELECT * FROM products;
      `);

    return product;
  } catch (error) {
    next(error);
  }
}

async function getProductById(productId) {
  try {
    const query = `
    SELECT 
    -- first, select everything from the products record
    products.id,
    products.name,
    products.price,
    products.description,
    products.product_img,
    products.created_at,
    -- build a new object from the inventory info
    json_build_object(
      'id', inventory.id,
      'quantity', inventory.quantity
    )
    AS inventory
    FROM products
    JOIN inventory ON products.inventory_id=inventory.id
    WHERE products.id=$1
    GROUP BY products.id, inventory.id;
  ;`;

    const {
      rows: [product],
    } = await client.query(query, [productId]);

    return product;
  } catch (err) {
    throw err;
  }
}

async function destroyProduct(product_id) {
  try {
    const {
      rows: [product],
    } = await client.query(
      `
      DELETE FROM products
      WHERE id=$1
      RETURNING *;
      `,
      [product_id]
    );
    return product;
  } catch (err) {
    throw err;
  }
}

async function updateProduct(productId, updateFields) {
  // updateFields could consist solely of (category_id) for example
  // so we need a way of making sure that we only update fields that are actually defined
  for (const field in updateFields) {
    if (updateFields[field] === undefined) {
      // this will remove any undefined field from my list of fields
      // that i'm receiving from the API layer
      delete updateFields[field];
    }
  }

  try {
    // first we need to modify the inventory record
    // and we don't even need to check if it exists
    // because by definition we've already created an inventory record
    // every time we add a new sock to our db
    const { quantity, inventory_id: inventoryId } = updateFields;

    if (!isNaN(+quantity)) {
      await updateInventory(inventoryId, quantity);
      delete updateFields.quantity;
    }

    // we're doing a plus 2 offset in our placeholder indices
    // to account for position 1, which will go to our sockId
    const setString = Object.keys(updateFields)
      .map((key, idx) => `${key} = $${idx + 2}`)
      .join(",");

    // this isn't great, since i'm making multiple trips
    // but, it's not a huge penalty for now...
    // first, update the sock record
    await client.query(
      `
        UPDATE products
        SET ${setString}
        WHERE id=$1
        RETURNING *;
        `,
      [productId, ...Object.values(updateFields)]
    );

    // second, grab the sock record via the getSockById adapter
    // this will give us access to the JOIN fields like category, inventory
    const product = await getProductById(productId);
    return product;
  } catch (err) {
    throw err;
  }
}
