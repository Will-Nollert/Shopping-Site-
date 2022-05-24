// grab our db client connection to use with our adapters
const client = require("../client");

module.exports = {
  // add your database adapter fns here
  createUser_order_items,
};

async function createUser_order_items({
  order_id,
  product_id,
  quantity,
  price_paid,
  created_at,
}) {
  try {
    const {
      rows: [user_order_items],
    } = await client.query(
      `
        INSERT INTO user_order_items (order_id, product_id, quantity, price_paid, created_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
        `,
      [order_id, product_id, quantity, price_paid, created_at]
    );

    return user_order_items;
  } catch (error) {
    throw error;
  }
}

//needs get user_order_items_By_user_id

async function getUserOrderItemsByOrderId(orderId) {}
