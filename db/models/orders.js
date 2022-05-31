// grab our db client connection to use with our adapters
const client = require("../client");

module.exports = {
  // add your database adapter fns here
  createOrder,
  getAllOrders,
  getOrderByOrderId,
  destroyOrder,
  updateOrder,
};
async function createOrder({ status, created_at }) {
  try {
    const {
      rows: [order],
    } = await client.query(
      `
        INSERT INTO orders (status, created_at)
        VALUES ($1, $2)
        RETURNING *;
      `,
      [status, created_at]
    );

    return order;
  } catch (error) {
    throw error;
  }
}

async function getAllOrders() {
  try {
    const { rows: order } = await client.query(
      `
      SELECT * FROM orders;
    `
    );
    return order;
  } catch (error) {
    throw error;
  }
}

async function getOrderByOrderId(orderId) {
  try {
    const {
      rows: [orderDetails],
    } = await client.query(
      `
    SELECT orders.*, json_agg(user_order_items.*) AS user_order_items FROM orders
    JOIN user_order_items ON user_order_items.order_id = orders.id
    WHERE orders.id = $1
    GROUP BY orders.id, user_order_items.order_id;`,
      [orderId]
    );

    return orderDetails;
  } catch (err) {
    throw err;
  }
}

async function destroyOrder(orderDetailsId) {
  try {
    const {
      rows: [orderDetails],
    } = await client.query(
      `
      DELETE FROM order_details
      WHERE id=$1
      RETURNING *;
    `,
      [orderDetailsId]
    );
    return orderDetails;
  } catch (error) {
    throw error;
  }
}

async function updateOrder({ id, status, created_at }) {
  try {
    const {
      rows: [orderDetails],
    } = await client.query(
      `
      UPDATE order_details
      SET status=$1, created_at=$2
      WHERE id=$3
      RETURNING *;
    `,
      [status, created_at, id]
    );
    return orderDetails;
  } catch (error) {
    throw error;
  }
}
