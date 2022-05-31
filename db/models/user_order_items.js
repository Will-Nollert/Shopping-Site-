// grab our db client connection to use with our adapters
const client = require("../client");

module.exports = {
  createUser_order_items,
  getAllUser_order_items,
  destroyUser_order_items,
  updateUser_order_items,
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

async function getAllUser_order_items() {
  try {
    const { rows: user_order_items } = await client.query(`
      SELECT * FROM user_order_items;
    `);

    return user_order_items;
  } catch (error) {
    throw error;
  }
}

async function destroyUser_order_items(orderItemsId) {
  try {
    const { rows: user_order_items } = await client.query(
      `
      DELETE FROM user_order_items
      WHERE id=$1
      RETURNING *;
    `,
      [orderItemsId]
    );
    return user_order_items;
  } catch (error) {
    throw error;
  }
}

async function updateUser_order_items({
  id,
  quantity,
  price_paid,
  created_at,
}) {
  try {
    const { rows: user_order_items } = await client.query(
      `
      UPDATE user_order_items
      SET quantity=$1, price_paid=$2, created_at=$3
      WHERE id=$4
      RETURNING *;
    `,
      [quantity, price_paid, created_at, id]
    );
    return user_order_items;
  } catch (error) {
    throw error;
  }
}
